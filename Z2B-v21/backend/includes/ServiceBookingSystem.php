<?php
/**
 * Service Booking System
 *
 * Handles service appointment booking:
 * - Calendar availability management
 * - Appointment scheduling
 * - Confirmation emails
 * - Reminder notifications
 * - Reschedule/cancellation
 *
 * @version 1.0
 * @date January 2026
 */

class ServiceBookingSystem {
    private $db;
    private $config;

    public function __construct($dbConnection, $config = []) {
        $this->db = $dbConnection;
        $this->config = array_merge([
            'reminder_hours_before' => [24, 1], // Send reminders 24h and 1h before
            'timezone' => 'Africa/Johannesburg',
            'booking_buffer_hours' => 2, // Minimum hours in advance
            'cancellation_hours' => 24 // Minimum hours before cancellation
        ], $config);

        date_default_timezone_set($this->config['timezone']);
    }

    /**
     * Create booking for purchased service
     *
     * @param array $bookingData Booking details
     * @return array Booking confirmation
     */
    public function createBooking($bookingData) {
        // Validate order and service purchase
        $orderItem = $this->validateServicePurchase($bookingData['order_id'], $bookingData['service_id']);

        if (!$orderItem) {
            throw new Exception("Service not found in order or not purchased");
        }

        // Validate date and time
        $bookingDateTime = $bookingData['date'] . ' ' . $bookingData['time'];

        if (!$this->isValidBookingTime($bookingDateTime)) {
            throw new Exception("Booking must be at least {$this->config['booking_buffer_hours']} hours in advance");
        }

        // Check availability
        if (!$this->isTimeSlotAvailable($bookingData['service_id'], $bookingDateTime, $bookingData['provider_id'] ?? null)) {
            throw new Exception("This time slot is no longer available");
        }

        // Get service details
        $service = $this->getServiceDetails($bookingData['service_id']);

        // Create booking record
        $bookingId = $this->insertBooking([
            'order_id' => $bookingData['order_id'],
            'order_item_id' => $orderItem['id'],
            'service_id' => $bookingData['service_id'],
            'buyer_id' => $orderItem['buyer_id'],
            'provider_id' => $bookingData['provider_id'] ?? $service['seller_id'],
            'booking_date' => $bookingData['date'],
            'booking_time' => $bookingData['time'],
            'duration_minutes' => $service['duration_minutes'],
            'notes' => $bookingData['notes'] ?? '',
            'status' => 'confirmed'
        ]);

        // Update order item with booking info
        $this->updateOrderItemBooking($orderItem['id'], $bookingDateTime, 'confirmed');

        // Generate meeting link (Zoom, Google Meet, etc.)
        $meetingLink = $this->generateMeetingLink($bookingId, $bookingData);

        // Update booking with meeting link
        $this->updateBookingMeetingLink($bookingId, $meetingLink);

        // Send confirmation email
        $this->sendBookingConfirmation($bookingId);

        // Schedule reminders
        $this->scheduleReminders($bookingId);

        return [
            'booking_id' => $bookingId,
            'booking_date' => $bookingData['date'],
            'booking_time' => $bookingData['time'],
            'meeting_link' => $meetingLink,
            'status' => 'confirmed'
        ];
    }

    /**
     * Get available time slots for a service
     *
     * @param int $serviceId Service ID
     * @param string $date Date (Y-m-d)
     * @param int $providerId Provider ID (optional)
     * @return array Available slots
     */
    public function getAvailableSlots($serviceId, $date, $providerId = null) {
        $service = $this->getServiceDetails($serviceId);

        if (!$service) {
            throw new Exception("Service not found");
        }

        // Get provider's availability schedule
        $schedule = $this->getProviderSchedule($providerId ?? $service['seller_id'], $date);

        // Get existing bookings for this date
        $existingBookings = $this->getBookingsByDate($serviceId, $date, $providerId);

        // Generate available slots
        $availableSlots = [];
        $slotDuration = $service['duration_minutes'];

        foreach ($schedule as $timeRange) {
            $start = strtotime($date . ' ' . $timeRange['start_time']);
            $end = strtotime($date . ' ' . $timeRange['end_time']);

            $currentSlot = $start;

            while ($currentSlot + ($slotDuration * 60) <= $end) {
                $slotTime = date('H:i', $currentSlot);

                // Check if slot is available (not booked)
                $isBooked = false;
                foreach ($existingBookings as $booking) {
                    $bookedTime = strtotime($booking['booking_time']);
                    $bookedEnd = $bookedTime + ($booking['duration_minutes'] * 60);

                    if ($currentSlot >= $bookedTime && $currentSlot < $bookedEnd) {
                        $isBooked = true;
                        break;
                    }
                }

                // Check if slot is in the future
                $slotDateTime = strtotime($date . ' ' . $slotTime);
                $bufferTime = time() + ($this->config['booking_buffer_hours'] * 3600);

                if ($slotDateTime >= $bufferTime && !$isBooked) {
                    $availableSlots[] = [
                        'time' => $slotTime,
                        'available' => true,
                        'slot_datetime' => date('Y-m-d H:i:s', $slotDateTime)
                    ];
                } else {
                    $availableSlots[] = [
                        'time' => $slotTime,
                        'available' => false,
                        'reason' => $isBooked ? 'booked' : 'past'
                    ];
                }

                $currentSlot += ($slotDuration * 60);
            }
        }

        return $availableSlots;
    }

    /**
     * Reschedule booking
     */
    public function rescheduleBooking($bookingId, $newDate, $newTime, $reason = '') {
        $booking = $this->getBooking($bookingId);

        if (!$booking) {
            throw new Exception("Booking not found");
        }

        if ($booking['status'] === 'cancelled') {
            throw new Exception("Cannot reschedule cancelled booking");
        }

        // Validate new time
        $newDateTime = $newDate . ' ' . $newTime;

        if (!$this->isValidBookingTime($newDateTime)) {
            throw new Exception("New booking time must be at least {$this->config['booking_buffer_hours']} hours in advance");
        }

        // Check availability
        if (!$this->isTimeSlotAvailable($booking['service_id'], $newDateTime, $booking['provider_id'])) {
            throw new Exception("New time slot is not available");
        }

        // Update booking
        $sql = "UPDATE service_bookings
                SET booking_date = ?,
                    booking_time = ?,
                    status = 'confirmed',
                    updated_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$newDate, $newTime, $bookingId]);

        // Log reschedule event
        $this->logBookingEvent($bookingId, 'rescheduled', "Rescheduled to $newDate $newTime. Reason: $reason");

        // Send reschedule notification
        $this->sendRescheduleNotification($bookingId, $newDate, $newTime);

        // Reschedule reminders
        $this->scheduleReminders($bookingId);

        return [
            'success' => true,
            'new_date' => $newDate,
            'new_time' => $newTime
        ];
    }

    /**
     * Cancel booking
     */
    public function cancelBooking($bookingId, $reason = '') {
        $booking = $this->getBooking($bookingId);

        if (!$booking) {
            throw new Exception("Booking not found");
        }

        // Check cancellation policy
        $bookingDateTime = strtotime($booking['booking_date'] . ' ' . $booking['booking_time']);
        $hoursUntilBooking = ($bookingDateTime - time()) / 3600;

        if ($hoursUntilBooking < $this->config['cancellation_hours']) {
            throw new Exception("Bookings must be cancelled at least {$this->config['cancellation_hours']} hours in advance");
        }

        // Update booking status
        $sql = "UPDATE service_bookings
                SET status = 'cancelled',
                    cancellation_reason = ?,
                    cancelled_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$reason, $bookingId]);

        // Log cancellation
        $this->logBookingEvent($bookingId, 'cancelled', $reason);

        // Send cancellation notification
        $this->sendCancellationNotification($bookingId);

        // Cancel reminders
        $this->cancelReminders($bookingId);

        return ['success' => true, 'message' => 'Booking cancelled successfully'];
    }

    /**
     * Mark booking as completed
     */
    public function completeBooking($bookingId, $notes = '') {
        $sql = "UPDATE service_bookings
                SET status = 'completed',
                    completion_notes = ?,
                    completed_at = NOW()
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$notes, $bookingId]);

        $this->logBookingEvent($bookingId, 'completed', $notes);

        // Send follow-up email
        $this->sendFollowUpEmail($bookingId);

        return ['success' => true];
    }

    /**
     * Send booking reminders
     */
    public function sendReminders() {
        // Get bookings that need reminders
        $upcomingBookings = $this->getUpcomingBookings();

        foreach ($upcomingBookings as $booking) {
            $bookingDateTime = strtotime($booking['booking_date'] . ' ' . $booking['booking_time']);
            $hoursUntil = ($bookingDateTime - time()) / 3600;

            // Check if reminder should be sent
            foreach ($this->config['reminder_hours_before'] as $reminderHours) {
                $shouldSend = ($hoursUntil <= $reminderHours && $hoursUntil > ($reminderHours - 1));

                if ($shouldSend && !$this->reminderAlreadySent($booking['id'], $reminderHours)) {
                    $this->sendReminderEmail($booking, $reminderHours);
                    $this->markReminderSent($booking['id'], $reminderHours);
                }
            }
        }
    }

    // ========================================
    // EMAIL NOTIFICATIONS
    // ========================================

    private function sendBookingConfirmation($bookingId) {
        $booking = $this->getBookingDetails($bookingId);
        $order = $this->getOrder($booking['order_id']);

        $to = $order['buyer_email'];
        $subject = "Booking Confirmed - {$booking['service_name']}";

        $body = "
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <h2 style='color: #6C63FF;'>✅ Your Service is Booked!</h2>
            <p>Hi {$order['buyer_name']},</p>
            <p>Your appointment has been confirmed!</p>

            <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                <h3>Booking Details</h3>
                <p><strong>Service:</strong> {$booking['service_name']}</p>
                <p><strong>Date:</strong> {$booking['booking_date']}</p>
                <p><strong>Time:</strong> {$booking['booking_time']}</p>
                <p><strong>Duration:</strong> {$booking['duration_minutes']} minutes</p>
                <p><strong>Provider:</strong> {$booking['provider_name']}</p>
            </div>

            <p><a href='{$booking['meeting_link']}'
                  style='background: #6C63FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;'>
                Join Meeting
            </a></p>

            <p><strong>What to do next:</strong></p>
            <ul>
                <li>Add this to your calendar</li>
                <li>Test your video/audio beforehand</li>
                <li>Prepare any questions you have</li>
                <li>Join the meeting 5 minutes early</li>
            </ul>

            <p style='color: #777; font-size: 14px;'>
                You'll receive reminders 24 hours and 1 hour before your appointment.
            </p>
        </body>
        </html>
        ";

        // Send email
        // mail($to, $subject, $body, $headers);

        $this->logEmailSent($bookingId, $to, $subject);
    }

    private function sendReminderEmail($booking, $hoursUntil) {
        // Similar email implementation for reminders
        $this->logEmailSent($booking['id'], $booking['buyer_email'], "Reminder: Appointment in {$hoursUntil} hours");
    }

    private function sendRescheduleNotification($bookingId, $newDate, $newTime) {
        // Email notification for rescheduled appointment
    }

    private function sendCancellationNotification($bookingId) {
        // Email notification for cancelled appointment
    }

    private function sendFollowUpEmail($bookingId) {
        // Follow-up email after completed session
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private function validateServicePurchase($orderId, $serviceId) {
        $sql = "SELECT oi.*
                FROM marketplace_order_items oi
                INNER JOIN marketplace_orders o ON oi.order_id = o.id
                WHERE o.order_number = ?
                AND oi.product_id = ?
                AND o.payment_status = 'paid'";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId, $serviceId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getServiceDetails($serviceId) {
        $sql = "SELECT p.*, s.*
                FROM marketplace_products p
                INNER JOIN marketplace_services s ON p.id = s.product_id
                WHERE p.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$serviceId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function isValidBookingTime($dateTime) {
        $bookingTimestamp = strtotime($dateTime);
        $minBookingTime = time() + ($this->config['booking_buffer_hours'] * 3600);

        return $bookingTimestamp >= $minBookingTime;
    }

    private function isTimeSlotAvailable($serviceId, $dateTime, $providerId = null) {
        $sql = "SELECT COUNT(*) as count
                FROM service_bookings
                WHERE service_id = ?
                AND CONCAT(booking_date, ' ', booking_time) = ?
                AND status IN ('confirmed', 'pending')";

        $params = [$serviceId, $dateTime];

        if ($providerId) {
            $sql .= " AND provider_id = ?";
            $params[] = $providerId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] == 0;
    }

    private function getProviderSchedule($providerId, $date) {
        // Get provider's working hours for the date
        // In production: Query actual availability database
        // For demo: Return standard business hours

        $dayOfWeek = date('w', strtotime($date));

        // Weekend - not available
        if ($dayOfWeek == 0 || $dayOfWeek == 6) {
            return [];
        }

        // Weekday - 9 AM to 5 PM
        return [
            ['start_time' => '09:00', 'end_time' => '17:00']
        ];
    }

    private function getBookingsByDate($serviceId, $date, $providerId = null) {
        $sql = "SELECT * FROM service_bookings
                WHERE service_id = ?
                AND booking_date = ?
                AND status IN ('confirmed', 'pending')";

        $params = [$serviceId, $date];

        if ($providerId) {
            $sql .= " AND provider_id = ?";
            $params[] = $providerId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function insertBooking($data) {
        $sql = "INSERT INTO service_bookings (
                    order_id, order_item_id, service_id, buyer_id, provider_id,
                    booking_date, booking_time, duration_minutes, notes, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['order_id'],
            $data['order_item_id'],
            $data['service_id'],
            $data['buyer_id'],
            $data['provider_id'],
            $data['booking_date'],
            $data['booking_time'],
            $data['duration_minutes'],
            $data['notes'],
            $data['status']
        ]);

        return $this->db->lastInsertId();
    }

    private function updateOrderItemBooking($itemId, $dateTime, $status) {
        $sql = "UPDATE marketplace_order_items
                SET booking_date = ?,
                    booking_time = ?,
                    booking_status = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([date('Y-m-d', strtotime($dateTime)), date('H:i:s', strtotime($dateTime)), $status, $itemId]);
    }

    private function generateMeetingLink($bookingId, $bookingData) {
        // In production: Integrate with Zoom, Google Meet, etc.
        // For demo: Return dummy link
        return "https://zoom.us/j/" . rand(100000000, 999999999);
    }

    private function updateBookingMeetingLink($bookingId, $meetingLink) {
        $sql = "UPDATE service_bookings SET meeting_link = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$meetingLink, $bookingId]);
    }

    private function scheduleReminders($bookingId) {
        // In production: Queue reminders for cron job to process
    }

    private function cancelReminders($bookingId) {
        // Cancel scheduled reminders
    }

    private function getBooking($bookingId) {
        $sql = "SELECT * FROM service_bookings WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getBookingDetails($bookingId) {
        $sql = "SELECT sb.*, p.name as service_name,
                       CONCAT(m.first_name, ' ', m.last_name) as provider_name
                FROM service_bookings sb
                INNER JOIN marketplace_products p ON sb.service_id = p.id
                INNER JOIN members m ON sb.provider_id = m.id
                WHERE sb.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getOrder($orderId) {
        $sql = "SELECT * FROM marketplace_orders WHERE order_number = ? OR id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$orderId, $orderId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getUpcomingBookings() {
        $sql = "SELECT * FROM service_bookings
                WHERE status = 'confirmed'
                AND CONCAT(booking_date, ' ', booking_time) > NOW()
                AND CONCAT(booking_date, ' ', booking_time) < DATE_ADD(NOW(), INTERVAL 25 HOUR)";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function reminderAlreadySent($bookingId, $hoursefore) {
        $sql = "SELECT COUNT(*) as count FROM booking_reminders
                WHERE booking_id = ? AND hours_before = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId, $hoursBefore]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] > 0;
    }

    private function markReminderSent($bookingId, $hoursBefore) {
        $sql = "INSERT INTO booking_reminders (booking_id, hours_before, sent_at)
                VALUES (?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId, $hoursBefore]);
    }

    private function logBookingEvent($bookingId, $event, $notes) {
        $sql = "INSERT INTO booking_events (booking_id, event_type, notes, created_at)
                VALUES (?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId, $event, $notes]);
    }

    private function logEmailSent($bookingId, $recipient, $subject) {
        $sql = "INSERT INTO email_logs (booking_id, recipient, subject, sent_at)
                VALUES (?, ?, ?, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$bookingId, $recipient, $subject]);
    }
}

/*
CREATE TABLE IF NOT EXISTS service_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    order_item_id INT NOT NULL,
    service_id INT NOT NULL,
    buyer_id INT NOT NULL,
    provider_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    meeting_link VARCHAR(500),
    notes TEXT,
    completion_notes TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'confirmed',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES marketplace_orders(id),
    FOREIGN KEY (order_item_id) REFERENCES marketplace_order_items(id),
    FOREIGN KEY (service_id) REFERENCES marketplace_products(id),
    FOREIGN KEY (buyer_id) REFERENCES members(id),
    FOREIGN KEY (provider_id) REFERENCES members(id),
    INDEX idx_date_time (booking_date, booking_time),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS booking_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS booking_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    hours_before INT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/
?>
