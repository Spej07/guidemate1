<?php
/**
 * Admin: list all tourist reviews (for moderation).
 */
session_start();
require_once 'dbconnect.php';

header('Content-Type: application/json');

if (empty($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin only']);
    exit;
}
session_write_close();

// All reviews: tourist name, guide/location, rating, comment, reply, date
$sql = "SELECT r.review_id, r.tourist_id, r.guide_id, r.rating, r.comment, r.created_at,
        t.first_name AS t_first, t.last_name AS t_last,
        g.first_name AS g_first, g.last_name AS g_last,
        rr.reply_text
        FROM reviews r
        LEFT JOIN tourists t ON t.tourist_id = r.tourist_id
        LEFT JOIN tour_guides g ON g.guide_id = r.guide_id
        LEFT JOIN review_replies rr ON rr.review_id = r.review_id AND rr.guide_id = r.guide_id
        ORDER BY r.created_at DESC";
$result = $mysqli->query($sql);

$reviews = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $touristName = trim(($row['t_first'] ?? '') . ' ' . ($row['t_last'] ?? ''));
        if ($touristName === '') $touristName = 'Tourist #' . (int)$row['tourist_id'];

        $guideId = isset($row['guide_id']) && $row['guide_id'] !== null ? (int)$row['guide_id'] : null;
        $guideName = 'Guide';
        if ($guideId) {
            $guideName = trim(($row['g_first'] ?? '') . ' ' . ($row['g_last'] ?? ''));
            if ($guideName === '') $guideName = 'Guide #' . $guideId;
        }

        $rawComment = (string)($row['comment'] ?? '');
        $locationName = '';
        $displayComment = $rawComment;
        $reviewType = 'location';
        if (preg_match('/^Type:\s*(location|guide)\RLocation:\s*(.+?)\RReview:\s*(.*)$/si', $rawComment, $m)) {
            $reviewType = strtolower(trim($m[1]));
            $locationName = trim($m[2]);
            $displayComment = trim($m[3]);
        } elseif (preg_match('/^Location:\s*(.+?)\RReview:\s*(.*)$/s', $rawComment, $m)) {
            $locationName = trim($m[1]);
            $displayComment = trim($m[2]);
        }

        $subject = $guideName;
        if ($locationName !== '') {
            $subject .= ' @ ' . $locationName;
        }

        $reviews[] = [
            'review_id'   => (int)$row['review_id'],
            'tourist_name'=> $touristName,
            'subject'     => $subject,
            'subject_type'=> 'guide',
            'guide_name'  => $guideName,
            'location_name' => $locationName,
            'review_type' => $reviewType,
            'rating'      => (int)$row['rating'],
            'comment'     => $displayComment,
            'reply_text'  => $row['reply_text'] ?? null,
            'created_at'  => $row['created_at'],
        ];
    }
}

echo json_encode($reviews);
