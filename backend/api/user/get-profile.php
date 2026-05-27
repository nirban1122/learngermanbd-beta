<?php
/**
 * Get User Profile Endpoint
 * GET /api/user/get-profile
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();

// Get user stats
$stmt = $db->prepare('SELECT total_points FROM user_points WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$points_result = $stmt->get_result();
$points = $points_result->fetch_assoc();
$stmt->close();

// Get streak
$stmt = $db->prepare('SELECT current_streak, longest_streak, last_activity_date FROM learning_streaks WHERE user_id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$streak_result = $stmt->get_result();
$streak = $streak_result->fetch_assoc() ?? ['current_streak' => 0, 'longest_streak' => 0];
$stmt->close();

// Get stats
$stmt = $db->prepare('SELECT COUNT(*) as lessons_completed FROM user_progress WHERE user_id = ? AND status = "completed"');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$lessons_result = $stmt->get_result();
$lessons = $lessons_result->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT COUNT(*) as vocabulary_learned FROM user_vocabulary WHERE user_id = ? AND learned = TRUE');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$vocab_result = $stmt->get_result();
$vocab = $vocab_result->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT MAX(score) as best_exam_score, COUNT(*) as exams_taken FROM user_exam_results WHERE user_id = ? AND status = "passed"');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$exam_result = $stmt->get_result();
$exam = $exam_result->fetch_assoc();
$stmt->close();

json_response(true, 'Profile retrieved', [
    'user' => $user,
    'points' => $points['total_points'] ?? 0,
    'streak' => $streak,
    'stats' => [
        'lessons_completed' => (int)$lessons['lessons_completed'],
        'vocabulary_learned' => (int)$vocab['vocabulary_learned'],
        'best_exam_score' => (int)($exam['best_exam_score'] ?? 0),
        'exams_passed' => (int)($exam['exams_taken'] ?? 0)
    ]
], 200);

?>
