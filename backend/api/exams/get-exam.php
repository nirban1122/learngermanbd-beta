<?php
/**
 * Get Single Exam Endpoint
 * GET /api/exams/get-exam?id=1
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();
$exam_id = (int)($_GET['id'] ?? 0);

if ($exam_id === 0) {
    json_response(false, 'Exam ID is required', null, 400);
}

// Get exam
$stmt = $db->prepare('SELECT id, title, description, level, duration_minutes, pass_score, total_questions, sections, content
                      FROM exams WHERE id = ?');
$stmt->bind_param('i', $exam_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'Exam not found', null, 404);
}

$exam = $result->fetch_assoc();
$stmt->close();

// Parse JSON fields
if ($exam['sections']) {
    $exam['sections'] = json_decode($exam['sections'], true);
}
if ($exam['content']) {
    $exam['content'] = json_decode($exam['content'], true);
}

// Get user's previous results
$stmt = $db->prepare('SELECT id, score, status, completed_at FROM user_exam_results
                      WHERE user_id = ? AND exam_id = ?
                      ORDER BY completed_at DESC
                      LIMIT 1');

$stmt->bind_param('ii', $user['id'], $exam_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $exam['user_result'] = $result->fetch_assoc();
} else {
    $exam['user_result'] = null;
}
$stmt->close();

json_response(true, 'Exam retrieved', $exam, 200);

?>
