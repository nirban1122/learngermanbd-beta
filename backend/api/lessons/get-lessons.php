<?php
/**
 * Get Lessons Endpoint
 * GET /api/lessons/get-lessons?level=A1&type=grammar&limit=10
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();
$level = $_GET['level'] ?? $user['level'];
$type = $_GET['type'] ?? null;
$limit = (int)($_GET['limit'] ?? 10);
$offset = (int)($_GET['offset'] ?? 0);

// Validate level
$valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
if (!in_array($level, $valid_levels)) {
    json_response(false, 'Invalid level', null, 400);
}

// Build query
$query = 'SELECT l.id, l.title, l.description, l.level, l.type, l.duration_minutes, l.xp_reward, l.created_at,
                  CASE WHEN up.status IS NOT NULL THEN up.status ELSE NULL END as user_status,
                  CASE WHEN up.score IS NOT NULL THEN up.score ELSE 0 END as user_score
           FROM lessons l
           LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
           WHERE l.level = ?';

$params = [$user['id'], $level];
$param_types = 'is';

// Add type filter if provided
if ($type && in_array($type, ['grammar', 'vocabulary', 'listening', 'reading', 'writing'])) {
    $query .= ' AND l.type = ?';
    $params[] = $type;
    $param_types .= 's';
}

$query .= ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
$params[] = $limit;
$params[] = $offset;
$param_types .= 'ii';

// Execute query
$stmt = $db->prepare($query);
$stmt->bind_param($param_types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$lessons = [];
while ($row = $result->fetch_assoc()) {
    $lessons[] = $row;
}
$stmt->close();

// Get total count
$count_query = 'SELECT COUNT(*) as total FROM lessons WHERE level = ?';
$count_params = [$level];
$count_param_types = 's';

if ($type) {
    $count_query .= ' AND type = ?';
    $count_params[] = $type;
    $count_param_types .= 's';
}

$stmt = $db->prepare($count_query);
$stmt->bind_param($count_param_types, ...$count_params);
$stmt->execute();
$count_result = $stmt->get_result();
$count_row = $count_result->fetch_assoc();
$total = $count_row['total'];
$stmt->close();

json_response(true, 'Lessons retrieved', [
    'lessons' => $lessons,
    'total' => $total,
    'limit' => $limit,
    'offset' => $offset,
    'current_level' => $level
], 200);

?>
