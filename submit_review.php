<?php
session_start();
header('Content-Type: application/json');
require_once 'dbconnect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    echo json_encode(['success' => false, 'message' => 'Invalid request body']);
    exit;
}

if (empty($_SESSION['role']) || $_SESSION['role'] !== 'tourist' || empty($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Please sign in as tourist.']);
    exit;
}

$locationName = trim((string)($data['location_name'] ?? ''));
$guideName = trim((string)($data['guide_name'] ?? ''));
$reviewType = strtolower(trim((string)($data['review_type'] ?? '')));
$comment = trim((string)($data['comment'] ?? ''));
$rating = isset($data['rating']) ? (int)$data['rating'] : 0;

if (!in_array($reviewType, ['location', 'guide'], true)) {
    $reviewType = 'location';
}

if ($locationName === '' || $guideName === '' || $comment === '' || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid fields']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

$touristStmt = $mysqli->prepare('SELECT tourist_id FROM tourists WHERE user_id = ? LIMIT 1');
if (!$touristStmt) {
    echo json_encode(['success' => false, 'message' => 'Could not prepare tourist lookup']);
    exit;
}
$touristStmt->bind_param('i', $userId);
$touristStmt->execute();
$touristRes = $touristStmt->get_result();
$touristRow = $touristRes ? $touristRes->fetch_assoc() : null;
$touristStmt->close();

if (!$touristRow || empty($touristRow['tourist_id'])) {
    echo json_encode(['success' => false, 'message' => 'Tourist account not found']);
    exit;
}
$touristId = (int)$touristRow['tourist_id'];

$guideStmt = $mysqli->prepare("
    SELECT guide_id
    FROM tour_guides
    WHERE TRIM(CONCAT(first_name, ' ', last_name)) = ?
    LIMIT 1
");
if (!$guideStmt) {
    echo json_encode(['success' => false, 'message' => 'Could not prepare guide lookup']);
    exit;
}
$guideStmt->bind_param('s', $guideName);
$guideStmt->execute();
$guideRes = $guideStmt->get_result();
$guideRow = $guideRes ? $guideRes->fetch_assoc() : null;
$guideStmt->close();

if (!$guideRow || empty($guideRow['guide_id'])) {
    echo json_encode(['success' => false, 'message' => 'Selected guide was not found']);
    exit;
}
$guideId = (int)$guideRow['guide_id'];

// Keep location context in comment for existing schema compatibility.
$finalComment = "Type: {$reviewType}\nLocation: {$locationName}\nReview: {$comment}";

$insertStmt = $mysqli->prepare('INSERT INTO reviews (tourist_id, guide_id, rating, comment) VALUES (?, ?, ?, ?)');
if (!$insertStmt) {
    echo json_encode(['success' => false, 'message' => 'Could not prepare insert']);
    exit;
}
$insertStmt->bind_param('iiis', $touristId, $guideId, $rating, $finalComment);
$ok = $insertStmt->execute();
$insertStmt->close();

if (!$ok) {
    echo json_encode(['success' => false, 'message' => 'Could not save review']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Review submitted successfully',
    'review' => [
        'location_name' => $locationName,
        'guide_name' => $guideName,
        'review_type' => $reviewType,
        'rating' => $rating,
        'comment' => $comment
    ]
]);
