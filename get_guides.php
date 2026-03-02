<?php
require_once 'dbconnect.php';

header('Content-Type: application/json');

$query = "SELECT first_name, last_name, bio, profile_image FROM tour_guides WHERE status = 'Active'";
$result = $mysqli->query($query);

$guides = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $guides[] = [
            'name' => $row['first_name'] . ' ' . $row['last_name'],
            'description' => $row['bio'] ?: 'Experienced tour guide.',
            'image' => $row['profile_image'] ?: 'photos/default.jpg'
        ];
    }
}

echo json_encode($guides);
?>