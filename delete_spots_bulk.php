<?php
/**
 * Admin: delete multiple tourist spots at once.
 * POST: destination_ids[] (array of destination_id integers)
 */
session_start();
require_once 'dbconnect.php';

header('Content-Type: application/json');

if (empty($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Admin only']);
    exit;
}

$raw = isset($_POST['destination_ids']) ? $_POST['destination_ids'] : [];
if (!is_array($raw)) $raw = $raw ? [$raw] : [];
$ids = array_filter(array_map('intval', $raw), function ($id) { return $id > 0; });
$ids = array_unique($ids);

if (empty($ids)) {
    echo json_encode(['ok' => false, 'error' => 'No valid spots selected.']);
    exit;
}

$check = $mysqli->query("SHOW TABLES LIKE 'destination_photos'");
$hasPhotos = $check && $check->num_rows > 0;

$deleted = 0;
foreach ($ids as $destination_id) {
    if ($hasPhotos) {
        $delPhotos = $mysqli->prepare("DELETE FROM destination_photos WHERE destination_id = ?");
        if ($delPhotos) {
            $delPhotos->bind_param('i', $destination_id);
            $delPhotos->execute();
            $delPhotos->close();
        }
    }
    $stmt = $mysqli->prepare("DELETE FROM destinations WHERE destination_id = ?");
    if ($stmt) {
        $stmt->bind_param('i', $destination_id);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $deleted++;
        }
        $stmt->close();
    }
}

echo json_encode(['ok' => true, 'deleted' => $deleted]);