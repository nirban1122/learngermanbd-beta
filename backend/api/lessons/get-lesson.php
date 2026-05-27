<?php
/**
 * Get Single Lesson Endpoint
 * GET /api/lessons/get-lesson?id=1
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();
$lesson_id = (int)($_GET['id'] ?? 0);

if ($lesson_id === 0) {
    json_response(false, 'Lesson ID is required', null, 400);
}

// Get lesson
$stmt = $db->prepare('SELECT id, title, description, level, type, content, duration_minutes, xp_reward, created_at
                      FROM lessons WHERE id = ?');
$stmt->bind_param('i', $lesson_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'Lesson not found', null, 404);
}

$lesson = $result->fetch_assoc();
$stmt->close();

// Parse JSON content
if ($lesson['content']) {
    $lesson['content'] = json_decode($lesson['content'], true);
}

// Get user progress for this lesson
$stmt = $db->prepare('SELECT status, score, completed_at FROM user_progress WHERE user_id = ? AND lesson_id = ?');
$stmt->bind_param('ii', $user['id'], $lesson_id);
$stmt->execute();
$progress_result = $stmt->get_result();

if ($progress_result->num_rows > 0) {
    $progress = $progress_result->fetch_assoc();
    $lesson['user_progress'] = $progress;
} else {
    $lesson['user_progress'] = null;
}
$stmt->close();

json_response(true, 'Lesson retrieved', $lesson, 200);

?>
