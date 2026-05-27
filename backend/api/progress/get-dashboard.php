<?php
/**
 * Get Dashboard Data Endpoint
 * GET /api/progress/get-dashboard
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();

// Get points
$stmt = $db->prepare('SELECT total_points FROM user_points WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$points_result = $stmt->get_result();
$points = $points_result->fetch_assoc() ?? ['total_points' => 0];
$stmt->close();

// Get streak
$stmt = $db->prepare('SELECT current_streak FROM learning_streaks WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$streak_result = $stmt->get_result();
$streak = $streak_result->fetch_assoc() ?? ['current_streak' => 0];
$stmt->close();

// Get lesson stats
$stmt = $db->prepare('SELECT COUNT(*) as total FROM user_progress WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$lesson_result = $stmt->get_result();
$lessons = $lesson_result->fetch_assoc();
$stmt->close();

// Get exam stats
$stmt = $db->prepare('SELECT COUNT(CASE WHEN status = "passed" THEN 1 END) as passed FROM user_exam_results WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$exam_result = $stmt->get_result();
$exams = $exam_result->fetch_assoc();
$stmt->close();

// Get vocabulary stats
$stmt = $db->prepare('SELECT COUNT(*) as total FROM user_vocabulary WHERE user_id = ? AND learned = TRUE');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$vocab_result = $stmt->get_result();
$vocab = $vocab_result->fetch_assoc();
$stmt->close();

// Get recent lessons
$stmt = $db->prepare('SELECT l.id, l.title, l.level, up.score, up.completed_at
                      FROM user_progress up
                      JOIN lessons l ON up.lesson_id = l.id
                      WHERE up.user_id = ?
                      ORDER BY up.updated_at DESC
                      LIMIT 5');

$stmt->bind_param('i', $user['id']);
$stmt->execute();
$recent_result = $stmt->get_result();

$recent_lessons = [];
while ($row = $recent_result->fetch_assoc()) {
    $recent_lessons[] = $row;
}
$stmt->close();

json_response(true, 'Dashboard data retrieved', [
    'greeting' => get_greeting(),
    'user' => [
        'name' => $user['full_name'],
        'level' => $user['level'],
        'email' => $user['email']
    ],
    'stats' => [
        'points' => (int)$points['total_points'],
        'streak' => (int)$streak['current_streak'],
        'lessons_done' => (int)$lessons['total'],
        'exams_passed' => (int)$exams['passed'],
        'vocabulary_learned' => (int)$vocab['total']
    ],
    'recent_lessons' => $recent_lessons
], 200);

function get_greeting() {
    $hour = date('H');
    if ($hour < 12) {
        return 'Good morning';
    } elseif ($hour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}

?>
