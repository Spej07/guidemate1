<?php
header('Content-Type: application/json');

// Include database connection
include 'dbconnect.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['review_type']) || !isset($data['subject']) || !isset($data['rating']) || !isset($data['comment'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$reviewType = $data['review_type'];
$subject = $data['subject'];
$rating = intval($data['rating']);
$comment = $data['comment'];
$touristId = isset($data['tourist_id']) ? intval($data['tourist_id']) : 1;

// Validate rating
if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating']);
    exit;
}

try {
    // Since tour guides and locations are stored in the JavaScript code, not in the database,
    // we'll use NULL for the guide_id and store the name in the comment
    
    if ($reviewType === 'location') {
        $finalComment = "Location: " . $subject . " - " . $comment;
        $guideId = "NULL"; // Use NULL for location since there's no destination table yet
    } else if ($reviewType === 'guide') {
        $finalComment = "Guide: " . $subject . " - " . $comment;
        $guideId = "NULL"; // Use NULL since the guide data is in JavaScript
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid review type']);
        exit;
    }

    // Insert review into database
    $insertSql = "INSERT INTO reviews (tourist_id, guide_id, rating, comment, status, created_at) 
                  VALUES (" . intval($touristId) . ", " . $guideId . ", " . intval($rating) . ", '" . $mysqli->real_escape_string($finalComment) . "', 'approved', NOW())";
    
    if ($mysqli->query($insertSql)) {
        echo json_encode(['success' => true, 'message' => 'Review submitted successfully']);
    } else {
        throw new Exception("Insert failed: " . $mysqli->error);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$mysqli->close();
?>
