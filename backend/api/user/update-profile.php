<?php
/**
 * Update User Profile Endpoint
 * POST /api/user/update-profile
 */

require_once __DIR__ . '/../../config.php';

require_auth();
require_method('POST');

$user = get_current_user();
$data = get_request_data();

// Allowed fields to update
$allowed_fields = ['full_name', 'language'];
$updates = [];
$param_types = '';
$params = [];

// Validate and prepare updates
if (isset($data['full_name'])) {
    $name = sanitize($data['full_name']);
    if (strlen($name) < 2) {
        json_response(false, 'Name must be at least 2 characters', null, 400);
    }
    $updates[] = 'full_name = ?';
    $params[] = $name;
    $param_types .= 's';
}

if (isset($data['language'])) {
    $lang = sanitize($data['language']);
    $valid_languages = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'ar', 'zh', 'ja'];
    if (!in_array($lang, $valid_languages)) {
        json_response(false, 'Invalid language', null, 400);
    }
    $updates[] = 'language = ?';
    $params[] = $lang;
    $param_types .= 's';
    set_language($lang);
}

if (empty($updates)) {
    json_response(false, 'No valid fields to update', null, 400);
}

// Add user_id to params
$params[] = $user['id'];
$param_types .= 'i';

// Update user
$query = 'UPDATE users SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?';
$stmt = $db->prepare($query);

if (!$stmt->bind_param($param_types, ...$params)) {
    json_response(false, 'Invalid parameters', null, 400);
}

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to update profile', null, 500);
}
$stmt->close();

log_action('profile_updated', 'User profile updated', 'success');

// Return updated user
$updated_user = get_current_user();
json_response(true, 'Profile updated successfully', $updated_user, 200);

?>
