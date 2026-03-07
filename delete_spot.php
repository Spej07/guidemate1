<?php
/**
 * Admin: delete a tourist spot (destination) when it's unavailable.
 */
session_start();
require_once 'dbconnect.php';

header('Content-Type: application/json');

if (empty($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Admin only']);
    exit;
}

$destination_id = isset($_POST['destination_id']) ? (int) $_POST['destination_id'] : 0;

if ($destination_id <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Invalid spot.']);
    exit;
}

// Remove related photos first if table exists (avoids FK issues)
$check = $mysqli->query("SHOW TABLES LIKE 'destination_photos'");
if ($check && $check->num_rows > 0) {
    $delPhotos = $mysqli->prepare("DELETE FROM destination_photos WHERE destination_id = ?");
    if ($delPhotos) {
        $delPhotos->bind_param('i', $destination_id);
        $delPhotos->execute();
        $delPhotos->close();
    }
}

$stmt = $mysqli->prepare("DELETE FROM destinations WHERE destination_id = ?");
if (!$stmt) {
    echo json_encode(['ok' => false, 'error' => 'Database error.']);
    exit;
}
$stmt->bind_param('i', $destination_id);
if ($stmt->execute()) {
    $stmt->close();
    echo json_encode(['ok' => true]);
} else {
    $stmt->close();
    echo json_encode(['ok' => false, 'error' => 'Could not delete.']);
}
