<?php
session_start();
header('Content-Type: application/json');

require_once 'dbconnect.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not signed in.'
    ]);
    exit();
}

$userId = (int)$_SESSION['user_id'];
$role = (string)$_SESSION['role'];
$username = (string)($_SESSION['username'] ?? '');

$response = [
    'success' => true,
    'user_id' => $userId,
    'role' => $role,
    'first_name' => '',
    'last_name' => '',
    'full_name' => $username !== '' ? $username : 'Guest Traveler',
    'profile_image' => 'photos/default.jpg'
];

if ($role === 'tourist') {
    $stmt = $mysqli->prepare('SELECT first_name, last_name, profile_image FROM tourists WHERE user_id = ? LIMIT 1');
} elseif ($role === 'guide') {
    $stmt = $mysqli->prepare('SELECT first_name, last_name, profile_image FROM tour_guides WHERE user_id = ? LIMIT 1');
} else {
    $stmt = null;
}

if ($stmt) {
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $response['first_name'] = trim((string)($row['first_name'] ?? ''));
        $response['last_name'] = trim((string)($row['last_name'] ?? ''));
        $response['full_name'] = trim($response['first_name'] . ' ' . $response['last_name']) ?: $response['full_name'];
        if (!empty($row['profile_image'])) {
            $response['profile_image'] = (string)$row['profile_image'];
        }
    }
    $stmt->close();
}

echo json_encode($response);
?>
