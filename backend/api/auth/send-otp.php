<?php
/**
 * Send OTP Endpoint / Helper
 * POST /api/auth/send-otp
 * Can also be called internally from register.php
 */

require_once __DIR__ . '/../../config.php';

// Allow both GET and POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();
    $email = $data['email'] ?? '';
} else {
    $email = $_GET['email'] ?? '';
}

if (empty($email)) {
    json_response(false, 'Email is required', null, 400);
}

$email = sanitize($email);

// Get user
$stmt = $db->prepare('SELECT id, full_name FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'User not found', null, 404);
}

$user = $result->fetch_assoc();
$stmt->close();

// Generate OTP
$otp = generate_otp();
$expires = date('Y-m-d H:i:s', time() + (OTP_EXPIRY_MINUTES * 60));

// Update user with OTP
$stmt = $db->prepare('UPDATE users SET otp_code = ?, otp_expires = ?, otp_attempts = 0, locked_until = NULL WHERE id = ?');
$stmt->bind_param('ssi', $otp, $expires, $user['id']);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to generate OTP', null, 500);
}
$stmt->close();

// Send email
$subject = 'Your Email Verification Code - Learn German With Fun';
$html_body = get_email_template('otp', [
    'otp' => $otp,
    'name' => $user['full_name']
]);

$email_sent = send_email($email, $subject, $html_body);

if ($email_sent) {
    json_response(true, 'OTP sent to your email', ['email' => $email], 200);
} else {
    json_response(false, 'Failed to send OTP email', null, 500);
}

?>
