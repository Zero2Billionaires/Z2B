<?php
$reference = htmlspecialchars($_GET['ref'] ?? '');
$tierCode = htmlspecialchars($_GET['tier'] ?? '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Registration - Z2B</title>
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
            padding: 2rem 0;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
            max-width: 600px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            padding: 2.5rem;
            margin-bottom: 2rem;
        }
        .success-icon {
            font-size: 4rem;
            color: var(--gold);
            animation: bounce 1s;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .form-control, .form-select {
            background: rgba(255,255,255,0.9);
            border: none;
            padding: 0.8rem;
            border-radius: 10px;
        }
        .btn-register {
            background: linear-gradient(135deg, var(--gold), var(--orange));
            color: var(--navy-blue);
            border: none;
            padding: 1rem 2rem;
            font-weight: bold;
            border-radius: 50px;
            width: 100%;
            transition: transform 0.3s;
        }
        .btn-register:hover {
            transform: translateY(-3px);
        }
        .result-container {
            display: none;
            background: rgba(255,255,255,0.15);
            padding: 2rem;
            border-radius: 15px;
            margin-top: 2rem;
        }
        .result-container.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Success Card -->
        <div class="card text-center">
            <i class="fas fa-check-circle success-icon"></i>
            <h1 style="color: var(--gold); margin-top: 1rem;">Payment Successful!</h1>
            <p>Reference: <strong><?php echo $reference; ?></strong></p>
            <p>Tier: <strong><?php echo $tierCode; ?></strong></p>
        </div>

        <!-- Registration Form -->
        <div class="card" id="registration-form">
            <h2 class="text-center mb-4" style="color: var(--gold);">Complete Your Registration</h2>
            <p class="text-center mb-4">Create your account to access your dashboard and start building your legacy!</p>

            <form id="registerForm">
                <div class="mb-3">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" id="fullName" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">Email Address *</label>
                    <input type="email" class="form-control" id="email" required>
                </div>

                <div class="mb-3">
                    <label class="form-label">WhatsApp Number (Optional)</label>
                    <input type="tel" class="form-control" id="phone" placeholder="+27...">
                </div>

                <div class="form-check mb-4">
                    <input class="form-check-input" type="checkbox" id="termsCheck" required>
                    <label class="form-check-label" for="termsCheck">
                        I agree to the Terms & Conditions and Privacy Policy
                    </label>
                </div>

                <button type="submit" class="btn-register" id="submitBtn">
                    <i class="fas fa-user-plus"></i> Create My Account
                </button>
            </form>

            <p class="text-center mt-3" style="font-size: 0.9rem; opacity: 0.8;">
                Your login credentials will be sent to your email
            </p>
        </div>

        <!-- Result Card (shown after registration) -->
        <div class="card result-container" id="result-card">
            <div class="text-center">
                <i class="fas fa-rocket" style="font-size: 3rem; color: var(--gold);"></i>
                <h2 style="color: var(--gold); margin-top: 1rem;">Account Created!</h2>
                <div id="result-message"></div>
                <a href="/login" class="btn-register mt-4">
                    <i class="fas fa-sign-in-alt"></i> Go to Login
                </a>
            </div>
        </div>
    </div>

    <script>
        const reference = '<?php echo $reference; ?>';
        const tierCode = '<?php echo $tierCode; ?>';

        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

            try {
                const formData = {
                    reference: reference,
                    email: document.getElementById('email').value,
                    full_name: document.getElementById('fullName').value,
                    phone: document.getElementById('phone').value
                };

                const response = await fetch('../api/auto-register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Hide form, show success
                    document.getElementById('registration-form').style.display = 'none';
                    document.getElementById('result-card').classList.add('show');

                    document.getElementById('result-message').innerHTML = `
                        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin-top: 1rem;">
                            <p><strong>Username:</strong> ${result.username}</p>
                            <p><strong>Password:</strong> <code style="background: rgba(0,0,0,0.3); padding: 0.3rem 0.6rem; border-radius: 5px;">${result.password}</code></p>
                            <p style="margin-top: 1rem; opacity: 0.8; font-size: 0.9rem;">
                                <i class="fas fa-envelope"></i> Login details have been sent to your email
                            </p>
                            <p style="margin-top: 1rem;">
                                <strong>Your Referral Link:</strong><br>
                                <input type="text" value="${result.referral_link}"
                                       onclick="this.select()" readonly
                                       style="width: 100%; padding: 0.5rem; border-radius: 5px; margin-top: 0.5rem; color: #0A2647;">
                            </p>
                        </div>
                    `;
                } else {
                    alert('Registration failed: ' + result.error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }

            } catch (error) {
                console.error('Registration error:', error);
                alert('An error occurred. Please try again or contact support.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    </script>
</body>
</html>
