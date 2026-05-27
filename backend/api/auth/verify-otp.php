<?php
/**
 * Verify OTP Endpoint
 * POST /api/auth/verify-otp
 */

require_once __DIR__ . '/../../config.php';

require_method('POST');

$data = get_request_data();

// Validation
if (empty($data['email'])) {
    json_response(false, 'Email is required', null, 400);
}

if (empty($data['otp'])) {
    json_response(false, 'OTP is required', null, 400);
}

$email = sanitize($data['email']);
$otp = sanitize($data['otp']);

// Validate OTP format (6 digits)
if (!preg_match('/^\d{6}$/', $otp)) {
    json_response(false, 'OTP must be 6 digits', null, 400);
}

// Get user
$stmt = $db->prepare('SELECT id, otp_code, otp_expires, otp_attempts, locked_until, verified FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'User not found', null, 404);
}

$user = $result->fetch_assoc();
$stmt->close();

// Check if user is already verified
if ($user['verified']) {
    json_response(false, 'Email already verified', null, 400);
}

// Check if locked
if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
    $remaining = ceil((strtotime($user['locked_until']) - time()) / 60);
    json_response(false, "Account locked. Try again in $remaining minutes", null, 429);
}

// Check if OTP expired
if (!$user['otp_expires'] || strtotime($user['otp_expires']) < time()) {
    json_response(false, 'OTP expired. Please request a new one', null, 400);
}

// Check if OTP matches
if ($user['otp_code'] !== $otp) {
    // Increment attempts
    $new_attempts = $user['otp_attempts'] + 1;

    if ($new_attempts >= OTP_MAX_ATTEMPTS) {
        // Lock account
        $locked_until = date('Y-m-d H:i:s', time() + (LOCKOUT_DURATION_MINUTES * 60));
        $stmt = $db->prepare('UPDATE users SET otp_attempts = ?, locked_until = ? WHERE id = ?');
        $stmt->bind_param('isi', $new_attempts, $locked_until, $user['id']);
        $stmt->execute();
        $stmt->close();

        log_action('otp_verification_failed', "Email: $email, Attempts: $new_attempts (LOCKED)", 'error');
        json_response(false, 'Too many attempts. Account locked for 30 minutes', null, 429);
    } else {
        // Update attempts
        $stmt = $db->prepare('UPDATE users SET otp_attempts = ? WHERE id = ?');
        $stmt->bind_param('ii', $new_attempts, $user['id']);
        $stmt->execute();
        $stmt->close();

        $remaining_attempts = OTP_MAX_ATTEMPTS - $new_attempts;
        log_action('otp_verification_failed', "Email: $email, Attempts: $new_attempts", 'error');
        json_response(false, "Incorrect code. $remaining_attempts attempts remaining", null, 400);
    }
}

// OTP is correct - verify user
$stmt = $db->prepare('UPDATE users SET verified = TRUE, otp_code = NULL, otp_expires = NULL, otp_attempts = 0, locked_until = NULL WHERE id = ?');
$stmt->bind_param('i', $user['id']);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Verification failed', null, 500);
}
$stmt->close();

// Create session
$_SESSION['user_id'] = $user['id'];
$_SESSION['email'] = $email;

// Get user data for session
$stmt = $db->prepare('SELECT level, is_admin FROM users WHERE id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$result = $stmt->get_result();
$user_data = $result->fetch_assoc();
$stmt->close();

$_SESSION['level'] = $user_data['level'];
$_SESSION['is_admin'] = $user_data['is_admin'];

log_action('email_verified', "Email: $email", 'success');

json_response(true, 'Email verified successfully', [
    'user_id' => $user['id'],
    'redirect' => '/dashboard'
], 200);

?>
