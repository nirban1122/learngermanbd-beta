<?php
/**
 * Change Password Endpoint
 * POST /api/user/change-password
 */

require_once __DIR__ . '/../../config.php';

require_auth();
require_method('POST');

$user = get_current_user();
$data = get_request_data();

$current_password = $data['current_password'] ?? '';
$new_password = $data['new_password'] ?? '';
$confirm_password = $data['confirm_password'] ?? '';

// Validation
if (empty($current_password)) {
    json_response(false, 'Current password is required', null, 400);
}

if (empty($new_password)) {
    json_response(false, 'New password is required', null, 400);
}

if ($new_password !== $confirm_password) {
    json_response(false, 'Passwords do not match', null, 400);
}

if (strlen($new_password) < 8) {
    json_response(false, 'Password must be at least 8 characters', null, 400);
}

// Get current password hash
$stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$result = $stmt->get_result();
$user_data = $result->fetch_assoc();
$stmt->close();

// Verify current password
if (!verify_password($current_password, $user_data['password'])) {
    json_response(false, 'Current password is incorrect', null, 401);
}

// Hash new password
$hashed_new = hash_password($new_password);

// Update password
$stmt = $db->prepare('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?');
$stmt->bind_param('si', $hashed_new, $user['id']);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to change password', null, 500);
}
$stmt->close();

log_action('password_changed', 'User password changed', 'success');

json_response(true, 'Password changed successfully', null, 200);

?>
