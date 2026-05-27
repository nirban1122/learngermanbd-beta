<?php
/**
 * Submit Exam Endpoint
 * POST /api/exams/submit-exam
 */

require_once __DIR__ . '/../../config.php';

require_auth();
require_method('POST');

$user = get_current_user();
$data = get_request_data();

$exam_id = (int)($data['exam_id'] ?? 0);
$answers = $data['answers'] ?? [];
$time_spent = (int)($data['time_spent_minutes'] ?? 0);

if ($exam_id === 0) {
    json_response(false, 'Exam ID is required', null, 400);
}

// Get exam
$stmt = $db->prepare('SELECT id, total_questions, pass_score, content FROM exams WHERE id = ?');
$stmt->bind_param('i', $exam_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'Exam not found', null, 404);
}

$exam = $result->fetch_assoc();
$stmt->close();

// Calculate score
$content = json_decode($exam['content'], true) ?? [];
$questions = $content['questions'] ?? [];

$correct_count = 0;
$score_details = [];

foreach ($answers as $answer) {
    $question_id = $answer['question_id'] ?? 0;
    $user_answer = $answer['answer'] ?? '';

    // Find question
    $question = null;
    foreach ($questions as $q) {
        if ($q['id'] == $question_id) {
            $question = $q;
            break;
        }
    }

    if ($question) {
        $correct_answer = $question['correct_answer'] ?? '';
        $is_correct = (strtolower(trim($user_answer)) === strtolower(trim($correct_answer)));

        if ($is_correct) {
            $correct_count++;
        }

        $score_details[] = [
            'question_id' => $question_id,
            'user_answer' => $user_answer,
            'correct_answer' => $correct_answer,
            'is_correct' => $is_correct
        ];
    }
}

// Calculate percentage score
$total_questions = count($questions);
$percentage = $total_questions > 0 ? round(($correct_count / $total_questions) * 100) : 0;
$passed = $percentage >= $exam['pass_score'];

// Store exam result
$answers_json = json_encode($score_details);
$status = $passed ? 'passed' : 'failed';

$stmt = $db->prepare('INSERT INTO user_exam_results (user_id, exam_id, score, max_score, status, answers, time_spent_minutes, completed_at)
                      VALUES (?, ?, ?, 100, ?, ?, ?, NOW())');

$stmt->bind_param('iiiissi', $user['id'], $exam_id, $percentage, $status, $answers_json, $time_spent);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to save exam result', null, 500);
}
$stmt->close();

// If passed, award XP
if ($passed) {
    $xp = 200;
    $stmt = $db->prepare('UPDATE user_points SET total_points = total_points + ? WHERE user_id = ?');
    $stmt->bind_param('ii', $xp, $user['id']);
    $stmt->execute();
    $stmt->close();
}

log_action('exam_completed', "Exam ID: $exam_id, Score: $percentage%, Status: $status", 'success');

json_response(true, 'Exam submitted successfully', [
    'exam_id' => $exam_id,
    'score' => $percentage,
    'max_score' => 100,
    'status' => $status,
    'passed' => $passed,
    'correct_answers' => $correct_count,
    'total_questions' => $total_questions,
    'xp_earned' => $passed ? 200 : 0,
    'section_scores' => calculate_section_scores($score_details)
], 200);

function calculate_section_scores($details) {
    // Group by section
    $sections = [];
    foreach ($details as $d) {
        $section = $d['question_id'] % 4; // Simple grouping (in real app, use actual section data)
        if (!isset($sections[$section])) {
            $sections[$section] = ['correct' => 0, 'total' => 0];
        }
        $sections[$section]['total']++;
        if ($d['is_correct']) {
            $sections[$section]['correct']++;
        }
    }
    return $sections;
}

?>
