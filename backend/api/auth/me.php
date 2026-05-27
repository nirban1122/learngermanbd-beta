<?php
/**
 * Get Current User Endpoint
 * GET /api/auth/me
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();

if (!$user) {
    json_response(false, 'User not found', null, 404);
}

json_response(true, 'User data retrieved', $user, 200);

?>
