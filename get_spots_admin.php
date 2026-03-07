<?php
/**
 * Admin: list tourist spots with destination_id and price for editing.
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

$col = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'price'");
$hasPrice = $col && $col->num_rows > 0;

$select = "destination_id, name, description";
$colImg = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'image'");
if ($colImg && $colImg->num_rows > 0) $select .= ", image";
$colRat = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'rating'");
if ($colRat && $colRat->num_rows > 0) $select .= ", rating, review_count";
if ($hasPrice) $select .= ", price";

// Return all tourist spots (no limit) so admin can change price for every one
$query = "SELECT $select FROM destinations ORDER BY name ASC";
$result = $mysqli->query($query);

$spots = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $spots[] = [
            'destination_id' => (int) $row['destination_id'],
            'name' => $row['name'],
            'description' => $row['description'] ?: '',
            'price' => ($hasPrice && isset($row['price']) && $row['price'] !== null && $row['price'] !== '') ? $row['price'] : '',
        ];
    }
}

echo json_encode($spots);
