<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Z2B Legacy Builders</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --navy-blue: #0A2647;
            --gold: #FFD700;
            --orange: #FF6B35;
        }
        body {
            background: linear-gradient(135deg, var(--navy-blue), #051428);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .success-container {
            max-width: 600px;
            text-align: center;
            padding: 3rem;
        }
        .success-icon {
            font-size: 6rem;
            color: var(--gold);
            animation: bounce 1s;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .btn-custom {
            background: linear-gradient(135deg, var(--gold), var(--orange));
            color: var(--navy-blue);
            border: none;
            padding: 1rem 2rem;
            font-weight: bold;
            border-radius: 50px;
            text-decoration: none;
            display: inline-block;
            margin-top: 2rem;
            transition: transform 0.3s;
        }
        .btn-custom:hover {
            transform: translateY(-3px);
            color: var(--navy-blue);
        }
    </style>
</head>
<body>
    <div class="success-container">
        <i class="fas fa-check-circle success-icon"></i>
        <h1 style="color: var(--gold); margin-top: 2rem;">Payment Successful!</h1>
        <p style="font-size: 1.2rem; margin-top: 1.5rem;">
            Thank you for your purchase! Your payment has been processed successfully.
        </p>
        <p style="opacity: 0.9;">
            You will receive a confirmation email shortly with your membership details and next steps.
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-top: 2rem;">
            <p style="margin: 0; opacity: 0.8;">Reference: <?php echo htmlspecialchars($_GET['ref'] ?? 'N/A'); ?></p>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.8;">Tier: <?php echo htmlspecialchars($_GET['tier'] ?? 'N/A'); ?></p>
        </div>
        <a href="/app/landing-page.html" class="btn-custom">
            <i class="fas fa-home"></i> Return to Home
        </a>
        <a href="/register" class="btn-custom" style="margin-left: 1rem;">
            <i class="fas fa-user-plus"></i> Complete Registration
        </a>
    </div>

    <script>
        // Store payment info for registration
        const urlParams = new URLSearchParams(window.location.search);
        const paymentData = {
            reference: urlParams.get('ref'),
            tier: urlParams.get('tier'),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('z2b_payment_complete', JSON.stringify(paymentData));
    </script>
</body>
</html>
