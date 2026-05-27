<?php
/**
 * LEARN GERMAN WITH FUN - Main Router & Index
 * Routes requests to appropriate handlers
 */

require_once __DIR__ . '/config.php';

// Get request path
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_path = str_replace('/backend', '', $request_path);
$request_path = trim($request_path, '/');

// Parse route
$parts = explode('/', $request_path);
$route = array_shift($parts) ?: 'home';

// Route to appropriate handler
switch ($route) {
    // API Routes
    case 'api':
        require_api_route($parts);
        break;

    // Admin Routes
    case 'admin':
        require_admin_route($parts);
        break;

    // Home
    case 'home':
    case '':
        json_response(true, 'Learn German With Fun API', ['version' => '1.0']);
        break;

    // Setup
    case 'setup':
        require __DIR__ . '/setup/install.php';
        break;

    // Not Found
    default:
        json_response(false, 'Route not found', null, 404);
}

/**
 * Route API requests
 */
function require_api_route($parts) {
    $endpoint = array_shift($parts) ?: 'index';
    $action = array_shift($parts) ?: 'index';

    $file = __DIR__ . "/api/$endpoint/$action.php";

    if (file_exists($file)) {
        require $file;
    } else {
        json_response(false, "Endpoint not found: /api/$endpoint/$action", null, 404);
    }
}

/**
 * Route Admin requests
 */
function require_admin_route($parts) {
    // Check authentication
    if (!is_authenticated()) {
        if (count($parts) === 0 || $parts[0] !== 'login') {
            json_response(false, 'Admin authentication required', null, 401);
        }
    }

    $page = array_shift($parts) ?: 'index';

    // Admin login page (special case - no auth required)
    if ($page === 'login') {
        require __DIR__ . '/admin/login.php';
        return;
    }

    // All other admin pages require authentication and admin role
    require_admin();

    // Check file exists
    $file = __DIR__ . "/admin/$page.php";
    if (file_exists($file)) {
        require $file;
    } else {
        json_response(false, "Admin page not found: /admin/$page", null, 404);
    }
}

?>
