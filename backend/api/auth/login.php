<?php
/**
 * Login Endpoint
 * POST /api/auth/login
 */

require_once __DIR__ . '/../../config.php';

require_method('POST');

$data = get_request_data();

// Validation
$errors = [];

if (empty($data['email'])) {
    $errors['email'] = 'Email is required';
} elseif (!is_valid_email($data['email'])) {
    $errors['email'] = 'Invalid email format';
}

if (empty($data['password'])) {
    $errors['password'] = 'Password is required';
}

if (!empty($errors)) {
    json_response(false, 'Validation errors', $errors, 400);
}

$email = sanitize($data['email']);
$password = $data['password']; // Don't sanitize password

// Get user
$stmt = $db->prepare('SELECT id, password, verified, is_admin, level, full_name, locked_until FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    log_action('login_failed', "Email: $email, Reason: User not found", 'error');
    json_response(false, 'Invalid email or password', null, 401);
}

$user = $result->fetch_assoc();
$stmt->close();

// Check if locked
if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
    $remaining = ceil((strtotime($user['locked_until']) - time()) / 60);
    log_action('login_failed', "Email: $email, Reason: Account locked", 'error');
    json_response(false, "Account locked. Try again in $remaining minutes", null, 429);
}

// Check if verified
if (!$user['verified']) {
    log_action('login_failed', "Email: $email, Reason: Email not verified", 'error');
    json_response(false, 'Please verify your email first', null, 403);
}

// Verify password
if (!verify_password($password, $user['password'])) {
    log_action('login_failed', "Email: $email, Reason: Invalid password", 'error');
    json_response(false, 'Invalid email or password', null, 401);
}

// Update last login
$stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$stmt->close();

// Create session
$_SESSION['user_id'] = $user['id'];
$_SESSION['email'] = $email;
$_SESSION['level'] = $user['level'];
$_SESSION['is_admin'] = (bool) $user['is_admin'];
$_SESSION['name'] = $user['full_name'];

log_action('user_logged_in', "Email: $email", 'success');

json_response(true, 'Login successful', [
    'user_id' => $user['id'],
    'email' => $email,
    'name' => $user['full_name'],
    'level' => $user['level'],
    'is_admin' => (bool) $user['is_admin'],
    'redirect' => '/dashboard'
], 200);

?>
