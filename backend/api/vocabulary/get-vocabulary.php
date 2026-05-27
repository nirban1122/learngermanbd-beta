<?php
/**
 * Get Vocabulary Endpoint
 * GET /api/vocabulary/get-vocabulary?level=A1&limit=12&offset=0
 */

require_once __DIR__ . '/../../config.php';

require_auth();

$user = get_current_user();
$level = $_GET['level'] ?? $user['level'];
$limit = (int)($_GET['limit'] ?? 12);
$offset = (int)($_GET['offset'] ?? 0);

// Validate level
$valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
if (!in_array($level, $valid_levels)) {
    json_response(false, 'Invalid level', null, 400);
}

// Get vocabulary with user progress
$stmt = $db->prepare('SELECT v.id, v.german_word, v.english_translation, v.article, v.part_of_speech,
                             v.difficulty_level, v.example_sentence, v.pronunciation, v.image_url,
                             CASE WHEN uv.learned IS NOT NULL THEN uv.learned ELSE FALSE END as user_learned,
                             CASE WHEN uv.learned_at IS NOT NULL THEN uv.learned_at ELSE NULL END as learned_at
                      FROM vocabulary v
                      LEFT JOIN user_vocabulary uv ON v.id = uv.vocabulary_id AND uv.user_id = ?
                      WHERE v.difficulty_level = ?
                      ORDER BY v.id
                      LIMIT ? OFFSET ?');

$stmt->bind_param('isii', $user['id'], $level, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$vocabulary = [];
while ($row = $result->fetch_assoc()) {
    $vocabulary[] = $row;
}
$stmt->close();

// Get total count
$stmt = $db->prepare('SELECT COUNT(*) as total FROM vocabulary WHERE difficulty_level = ?');
$stmt->bind_param('s', $level);
$stmt->execute();
$count_result = $stmt->get_result();
$count_row = $count_result->fetch_assoc();
$total = $count_row['total'];
$stmt->close();

// Get learned count
$stmt = $db->prepare('SELECT COUNT(*) as learned FROM user_vocabulary WHERE user_id = ? AND learned = TRUE');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$learned_result = $stmt->get_result();
$learned_row = $learned_result->fetch_assoc();
$learned_count = $learned_row['learned'];
$stmt->close();

json_response(true, 'Vocabulary retrieved', [
    'vocabulary' => $vocabulary,
    'total' => $total,
    'learned' => $learned_count,
    'level' => $level,
    'limit' => $limit,
    'offset' => $offset
], 200);

?>
