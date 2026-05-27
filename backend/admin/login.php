<?php
/**
 * Admin Login Page
 */

require_once __DIR__ . '/../config.php';

// If already logged in, redirect to dashboard
if (is_authenticated() && is_admin()) {
    header('Location: /admin');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Email and password are required';
    } else {
        // Check credentials
        $stmt = $db->prepare('SELECT id, password, is_admin, full_name FROM users WHERE email = ? AND is_admin = TRUE');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $error = 'Invalid admin credentials';
            log_action(null, 'admin_login_failed', 'Email: ' . $email . ', Reason: User not found or not admin', 'error');
        } else {
            $user = $result->fetch_assoc();
            if (verify_password($password, $user['password'])) {
                // Create session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $email;
                $_SESSION['is_admin'] = true;
                $_SESSION['name'] = $user['full_name'];

                // Update last login
                $update_stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
                $update_stmt->bind_param('i', $user['id']);
                $update_stmt->execute();
                $update_stmt->close();

                log_action($user['id'], 'admin_logged_in', 'Admin login successful', 'success');

                header('Location: /admin');
                exit;
            } else {
                $error = 'Invalid admin credentials';
                log_action(null, 'admin_login_failed', 'Email: ' . $email . ', Reason: Invalid password', 'error');
            }
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Learn German With Fun</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            width: 100%;
            max-width: 400px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #ffc107;
            font-size: 24px;
            margin-bottom: 5px;
        }
        .logo p {
            color: #999;
            font-size: 12px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #fff;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #333;
            border-radius: 5px;
            background: #0a0a0a;
            color: #fff;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #ffc107;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }
        .login-btn {
            width: 100%;
            padding: 12px;
            background: #ffc107;
            color: #000;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        .login-btn:hover {
            background: #ffb300;
        }
        .alert {
            padding: 12px;
            background: #4a1a1a;
            color: #f44336;
            border: 1px solid #f44336;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>🔐 Admin Login</h1>
            <p>Learn German With Fun</p>
        </div>

        <?php if ($error): ?>
            <div class="alert"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="email">Admin Email</label>
                <input type="email" id="email" name="email" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="login-btn">Login to Admin Panel</button>
        </form>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            Default: admin@learngermanwith.fun / admin123!
        </p>
    </div>
</body>
</html>
<?php
?>
