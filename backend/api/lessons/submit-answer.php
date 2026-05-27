<?php
/**
 * Submit Lesson Answer Endpoint
 * POST /api/lessons/submit-answer
 */

require_once __DIR__ . '/../../config.php';

require_auth();
require_method('POST');

$user = get_current_user();
$data = get_request_data();

$lesson_id = (int)($data['lesson_id'] ?? 0);
$answer = $data['answer'] ?? '';

if ($lesson_id === 0) {
    json_response(false, 'Lesson ID is required', null, 400);
}

// Get lesson
$stmt = $db->prepare('SELECT id, content, xp_reward FROM lessons WHERE id = ?');
$stmt->bind_param('i', $lesson_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'Lesson not found', null, 404);
}

$lesson = $result->fetch_assoc();
$stmt->close();

$content = json_decode($lesson['content'], true);

// Check if answer is correct (simple equality check)
// In a real app, you'd have more complex validation logic
$correct_answer = $content['correct_answer'] ?? null;
$is_correct = (strtolower(trim($answer)) === strtolower(trim($correct_answer)));

$score = $is_correct ? 100 : 0;

// Upsert user progress
$stmt = $db->prepare('INSERT INTO user_progress (user_id, lesson_id, status, score, completed_at)
                      VALUES (?, ?, ?, ?, NOW())
                      ON DUPLICATE KEY UPDATE status = ?, score = ?, completed_at = NOW()');

$status = $is_correct ? 'completed' : 'in_progress';
$stmt->bind_param('iisisii', $user['id'], $lesson_id, $status, $score, $status, $score);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to save progress', null, 500);
}
$stmt->close();

// If correct, award XP
if ($is_correct) {
    // Update user points
    $xp = $lesson['xp_reward'] ?? 50;
    $stmt = $db->prepare('UPDATE user_points SET total_points = total_points + ? WHERE user_id = ?');
    $stmt->bind_param('ii', $xp, $user['id']);
    $stmt->execute();
    $stmt->close();

    // Update learning streak
    $today = date('Y-m-d');
    $stmt = $db->prepare('SELECT id, last_activity_date, current_streak, longest_streak FROM learning_streaks WHERE user_id = ?');
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $streak_result = $stmt->get_result();

    if ($streak_result->num_rows > 0) {
        $streak = $streak_result->fetch_assoc();
        $yesterday = date('Y-m-d', time() - 86400);

        if ($streak['last_activity_date'] === $today) {
            // Already counted today
            $new_streak = $streak['current_streak'];
        } elseif ($streak['last_activity_date'] === $yesterday) {
            // Continue streak
            $new_streak = $streak['current_streak'] + 1;
        } else {
            // Break streak
            $new_streak = 1;
        }

        $longest = max($new_streak, $streak['longest_streak']);

        $stmt = $db->prepare('UPDATE learning_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE user_id = ?');
        $stmt->bind_param('iisi', $new_streak, $longest, $today, $user['id']);
        $stmt->execute();
        $stmt->close();
    }
    $stmt->close();

    // Log action
    log_action('lesson_completed', "Lesson ID: $lesson_id, Score: $score", 'success');
}

json_response(true, $is_correct ? 'Correct answer!' : 'Incorrect answer', [
    'correct' => $is_correct,
    'correct_answer' => $correct_answer,
    'user_answer' => $answer,
    'score' => $score,
    'explanation' => $content['explanation'] ?? '',
    'xp_earned' => $is_correct ? ($lesson['xp_reward'] ?? 50) : 0
], 200);

?>
