<?php
/**
 * Register Endpoint
 * POST /api/auth/register
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
} elseif (strlen($data['password']) < 8) {
    $errors['password'] = 'Password must be at least 8 characters';
}

if (empty($data['name'])) {
    $errors['name'] = 'Name is required';
} elseif (strlen($data['name']) < 2) {
    $errors['name'] = 'Name must be at least 2 characters';
}

if (!empty($errors)) {
    json_response(false, 'Validation errors', $errors, 400);
}

// Sanitize inputs
$email = sanitize($data['email']);
$password = $data['password']; // Don't sanitize password
$name = sanitize($data['name']);

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    json_response(false, 'Email already registered', null, 409);
}
$stmt->close();

// Hash password
$hashed_password = hash_password($password);

// Insert user
$stmt = $db->prepare('INSERT INTO users (email, password, full_name, level, language, verified, created_at)
                      VALUES (?, ?, ?, ?, ?, FALSE, NOW())');

$level = 'A1';
$language = get_current_language();

$stmt->bind_param('sssss', $email, $hashed_password, $name, $level, $language);

if (!$stmt->execute()) {
    $stmt->close();
    log_action('registration_failed', "Email: $email", 'error');
    json_response(false, 'Registration failed', null, 500);
}

$stmt->close();

// Get the new user
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

$user_id = $user['id'];

// Create learning streak record
$stmt = $db->prepare('INSERT INTO learning_streaks (user_id, current_streak, longest_streak, created_at)
                      VALUES (?, 0, 0, NOW())');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$stmt->close();

// Create user points record
$stmt = $db->prepare('INSERT INTO user_points (user_id, total_points, created_at)
                      VALUES (?, 0, NOW())');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$stmt->close();

// Generate and send OTP
require __DIR__ . '/send-otp.php';
?>
