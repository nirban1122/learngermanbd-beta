<?php
/**
 * Logout Endpoint
 * GET /api/auth/logout
 * POST /api/auth/logout
 */

require_once __DIR__ . '/../../config.php';

// Log the logout action
log_action('user_logged_out', 'User logout', 'success');

// Destroy session
session_destroy();

// Clear cookies
setcookie('PHPSESSID', '', time() - 3600, '/');

json_response(true, 'Logged out successfully', [
    'redirect' => '/'
], 200);

?>
