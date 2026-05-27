<?php
/**
 * LEARN GERMAN WITH FUN - Core Configuration
 * Database, session, and utility functions
 */

// Load .env.local if exists (before defining constants)
$env_file = __DIR__ . '/.env.local';
if (file_exists($env_file)) {
    $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Database Configuration (from .env or defaults)
define('DB_HOST', defined('DB_HOST') ? DB_HOST : 'localhost');
define('DB_USER', defined('DB_USER') ? DB_USER : 'root');
define('DB_PASS', defined('DB_PASS') ? DB_PASS : '');
define('DB_NAME', defined('DB_NAME') ? DB_NAME : 'learn_german');

// App Configuration
define('APP_URL', defined('FRONTEND_URL') ? FRONTEND_URL : 'http://localhost:5173');
define('API_URL', defined('BACKEND_URL') ? BACKEND_URL : 'http://localhost:8000/api');
define('APP_NAME', 'Learn German With Fun');
define('APP_EMAIL', 'noreply@learngermanwith.fun');

// Brevo Email Configuration
define('BREVO_SMTP_HOST', defined('SMTP_HOST') ? SMTP_HOST : 'smtp-relay.brevo.com');
define('BREVO_SMTP_PORT', defined('SMTP_PORT') ? (int)SMTP_PORT : 587);
define('BREVO_SMTP_USER', defined('SMTP_USER') ? SMTP_USER : 'aca0f0001@smtp-brevo.com');
define('BREVO_SMTP_PASS', defined('SMTP_PASS') ? SMTP_PASS : 'bskQ2hexTBFVAbX');
define('BREVO_FROM_EMAIL', 'noreply@learngermanwith.fun');
define('BREVO_FROM_NAME', 'Learn German With Fun');

// Supported Languages
$SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'ar', 'zh', 'ja'];

// CORS Configuration - dynamic origin matching
$allowed_origins = [
    'https://learngermanwith.fun',
    'https://www.learngermanwith.fun',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8000',
];

// Also allow the configured FRONTEND_URL
if (defined('FRONTEND_URL') && !in_array(FRONTEND_URL, $allowed_origins)) {
    $allowed_origins[] = FRONTEND_URL;
}

$request_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($request_origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $request_origin");
} else {
    // Fallback: allow the first configured origin
    header('Access-Control-Allow-Origin: ' . APP_URL);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database Connection
try {
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($db->connect_error) {
        throw new Exception('Database connection failed: ' . $db->connect_error);
    }
    $db->set_charset('utf8mb4');
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode([
        'success' => false,
        'message' => 'Database connection error',
    ]));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function json_response($success, $message = '', $data = null, $code = 200) {
    http_response_code($code);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) $response['data'] = $data;
    echo json_encode($response);
    exit;
}

function sanitize($input) {
    if (is_array($input)) return array_map('sanitize', $input);
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function hash_password($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verify_password($password, $hash) {
    return password_verify($password, $hash);
}

function generate_otp() {
    return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function generate_token($length = 32) {
    return bin2hex(random_bytes($length));
}

function is_authenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function require_auth() {
    if (!is_authenticated()) json_response(false, 'Authentication required', null, 401);
}

function get_current_user_id() {
    return $_SESSION['user_id'] ?? null;
}

function get_current_user() {
    global $db;
    if (!is_authenticated()) return null;
    $user_id = get_current_user_id();
    $stmt = $db->prepare('SELECT id, email, full_name, level, language, verified, created_at FROM users WHERE id = ?');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    return $user;
}

function is_admin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

function require_admin() {
    if (!is_admin()) json_response(false, 'Admin access required', null, 403);
}

function get_current_language() {
    return $_SESSION['language'] ?? 'en';
}

function set_language($lang) {
    global $SUPPORTED_LANGUAGES;
    if (in_array($lang, $SUPPORTED_LANGUAGES)) {
        $_SESSION['language'] = $lang;
        return true;
    }
    return false;
}

function log_action($action, $details = '', $status = 'success') {
    global $db;
    $user_id = get_current_user_id();
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $stmt = $db->prepare('INSERT INTO audit_log (user_id, action, details, status, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $stmt->bind_param('issss', $user_id, $action, $details, $status, $ip_address);
    $stmt->execute();
    $stmt->close();
}

function get_cache($key) {
    $file = __DIR__ . '/cache/' . md5($key) . '.cache';
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (isset($data['expires']) && $data['expires'] > time()) return $data['value'];
        unlink($file);
    }
    return null;
}

function set_cache($key, $value, $ttl = 3600) {
    $file = __DIR__ . '/cache/' . md5($key) . '.cache';
    file_put_contents($file, json_encode(['value' => $value, 'expires' => time() + $ttl]));
}

function clear_cache($key = null) {
    if ($key) {
        $file = __DIR__ . '/cache/' . md5($key) . '.cache';
        if (file_exists($file)) unlink($file);
    } else {
        array_map('unlink', glob(__DIR__ . '/cache/*.cache'));
    }
}

function send_email($to, $subject, $html_body, $from_name = null) {
    $from_name = $from_name ?? BREVO_FROM_NAME;
    try {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $from_name <" . BREVO_FROM_EMAIL . ">\r\n";
        $mail_sent = mail($to, $subject, $html_body, $headers);
        if ($mail_sent) {
            log_action('email_sent', "To: $to, Subject: $subject", 'success');
            return true;
        }
        log_action('email_failed', "To: $to, Subject: $subject", 'error');
        return false;
    } catch (Exception $e) {
        log_action('email_error', $e->getMessage(), 'error');
        return false;
    }
}

function get_email_template($type, $data = []) {
    $templates = [
        'otp' => function($data) {
            $otp = $data['otp'] ?? '000000';
            $name = $data['name'] ?? 'User';
            return '<html><head><style>body{font-family:Arial,sans-serif;background:#0a0a0a}.container{max-width:600px;margin:0 auto;background:#1a1a1a;padding:40px;border-radius:10px;border:1px solid #333}.header{text-align:center;color:#ffc107;font-size:24px;margin-bottom:20px}.content{text-align:center;color:#fff}.otp-box{background:#ffc107;padding:20px;margin:20px auto;border-radius:8px;font-size:32px;letter-spacing:8px;font-weight:bold;color:#000;display:inline-block}.footer{text-align:center;color:#666;margin-top:30px;font-size:12px}</style></head><body><div class="container"><div class="header">LEARN GERMAN WITH FUN</div><div class="content"><h2>Verify Your Email</h2><p>Hi ' . htmlspecialchars($name) . ',</p><p>Your verification code:</p><div class="otp-box">' . implode(' ', str_split($otp)) . '</div><p style="color:#999">This code expires in 10 minutes.</p><p style="color:#666;font-size:12px">If you didn\'t request this, ignore this email.</p></div><div class="footer">&copy; 2024 Learn German With Fun</div></div></body></html>';
        }
    ];
    return isset($templates[$type]) ? $templates[$type]($data) : '';
}

function get_request_data() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!$data) $data = $_POST;
    return $data ?? [];
}

function require_method($method) {
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) json_response(false, "Method not allowed", null, 405);
}

define('OTP_EXPIRY_MINUTES', 10);
define('OTP_MAX_ATTEMPTS', 5);
define('LOCKOUT_DURATION_MINUTES', 30);
