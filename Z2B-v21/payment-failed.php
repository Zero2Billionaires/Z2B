<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - Z2B Legacy Builders</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --navy-blue: #0A2647;
            --gold: #FFD700;
            --orange: #FF6B35;
            --red: #ff6b6b;
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
        .failed-container {
            max-width: 600px;
            text-align: center;
            padding: 3rem;
        }
        .failed-icon {
            font-size: 6rem;
            color: var(--red);
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
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
    <div class="failed-container">
        <i class="fas fa-times-circle failed-icon"></i>
        <h1 style="color: var(--red); margin-top: 2rem;">Payment Failed</h1>
        <p style="font-size: 1.2rem; margin-top: 1.5rem;">
            Unfortunately, your payment could not be processed.
        </p>
        <p style="opacity: 0.9;">
            This could be due to insufficient funds, an incorrect card number, or a temporary issue with your bank.
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-top: 2rem;">
            <p style="margin: 0; color: var(--gold); font-weight: bold;">Need Help?</p>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.8;">
                Contact us on WhatsApp: <a href="https://wa.me/27774901639" style="color: var(--gold);">077 490 1639</a>
            </p>
        </div>
        <a href="/app/landing-page.html#tiers" class="btn-custom">
            <i class="fas fa-redo"></i> Try Again
        </a>
        <a href="/app/landing-page.html" class="btn-custom" style="margin-left: 1rem;">
            <i class="fas fa-home"></i> Return to Home
        </a>
    </div>
</body>
</html>
