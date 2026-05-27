<?php
/**
 * Mark Vocabulary as Learned Endpoint
 * POST /api/vocabulary/mark-learned
 */

require_once __DIR__ . '/../../config.php';

require_auth();
require_method('POST');

$user = get_current_user();
$data = get_request_data();

$vocab_id = (int)($data['vocabulary_id'] ?? 0);
$learned = $data['learned'] ?? true;

if ($vocab_id === 0) {
    json_response(false, 'Vocabulary ID is required', null, 400);
}

// Check if vocabulary exists
$stmt = $db->prepare('SELECT id FROM vocabulary WHERE id = ?');
$stmt->bind_param('i', $vocab_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(false, 'Vocabulary not found', null, 404);
}
$stmt->close();

// Insert or update user vocabulary progress
$learned_at = $learned ? date('Y-m-d H:i:s') : null;
$stmt = $db->prepare('INSERT INTO user_vocabulary (user_id, vocabulary_id, learned, learned_at, review_count)
                      VALUES (?, ?, ?, ?, 1)
                      ON DUPLICATE KEY UPDATE learned = ?, learned_at = ?, review_count = review_count + 1');

$stmt->bind_param('iibsbs', $user['id'], $vocab_id, $learned, $learned_at, $learned, $learned_at);

if (!$stmt->execute()) {
    $stmt->close();
    json_response(false, 'Failed to update vocabulary progress', null, 500);
}
$stmt->close();

// Award points if learned
if ($learned) {
    $xp = 10; // Points for learning a vocabulary word
    $stmt = $db->prepare('UPDATE user_points SET total_points = total_points + ? WHERE user_id = ?');
    $stmt->bind_param('ii', $xp, $user['id']);
    $stmt->execute();
    $stmt->close();
}

log_action('vocabulary_learned', "Vocabulary ID: $vocab_id, Learned: " . ($learned ? 'true' : 'false'), 'success');

json_response(true, 'Vocabulary progress updated', [
    'vocabulary_id' => $vocab_id,
    'learned' => $learned,
    'xp_earned' => $learned ? 10 : 0
], 200);

?>
