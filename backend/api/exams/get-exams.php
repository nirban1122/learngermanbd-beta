<?php
/**
 * Get Exams Endpoint
 * GET /api/exams/get-exams?level=A1
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();
$level = $_GET['level'] ?? $user['level'];

$valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
if (!in_array($level, $valid_levels)) {
    json_response(false, 'Invalid level', null, 400);
}

// Get exams with user results
$stmt = $db->prepare('SELECT e.id, e.title, e.description, e.level, e.duration_minutes, e.pass_score, e.total_questions,
                             MAX(uer.score) as best_score, MAX(CASE WHEN uer.status = "passed" THEN 1 ELSE 0 END) as passed,
                             COUNT(DISTINCT uer.id) as attempt_count
                      FROM exams e
                      LEFT JOIN user_exam_results uer ON e.id = uer.exam_id AND uer.user_id = ?
                      WHERE e.level = ?
                      GROUP BY e.id
                      ORDER BY e.id');

$stmt->bind_param('is', $user['id'], $level);
$stmt->execute();
$result = $stmt->get_result();

$exams = [];
while ($row = $result->fetch_assoc()) {
    $exams[] = $row;
}
$stmt->close();

json_response(true, 'Exams retrieved', [
    'exams' => $exams,
    'level' => $level
], 200);

?>
