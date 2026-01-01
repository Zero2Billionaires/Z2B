<?php
/**
 * Upload Proof of Payment API
 * Handles file uploads for EFT/Cash deposit proofs
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Validate file upload
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

// Validate tier_upgrade_id
$tierUpgradeId = isset($_POST['tier_upgrade_id']) ? intval($_POST['tier_upgrade_id']) : null;
if (!$tierUpgradeId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'tier_upgrade_id is required']);
    exit;
}

$file = $_FILES['file'];
$fileSize = $file['size'];
$fileTmpName = $file['tmp_name'];
$fileName = $file['name'];

// Validate file size (max 5MB)
$maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
if ($fileSize > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File size exceeds 5MB limit']);
    exit;
}

// Get file extension
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// Validate file type
$allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, PDF']);
    exit;
}

// Validate MIME type for security
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $fileTmpName);
finfo_close($finfo);

$allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf'
];

if (!in_array($mimeType, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file format detected']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/../uploads/payment-proofs/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$date = date('Y-m-d');
$randomString = bin2hex(random_bytes(4));
$newFileName = $date . '-' . $tierUpgradeId . '-' . $randomString . '.' . $fileExtension;
$uploadPath = $uploadDir . $newFileName;

// Move uploaded file
if (!move_uploaded_file($fileTmpName, $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
    exit;
}

// Generate public URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$fileUrl = $protocol . '://' . $host . '/uploads/payment-proofs/' . $newFileName;

echo json_encode([
    'success' => true,
    'file_url' => $fileUrl,
    'file_name' => $newFileName,
    'file_size' => $fileSize,
    'uploaded_at' => date('Y-m-d H:i:s')
]);
