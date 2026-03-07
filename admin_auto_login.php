<?php
session_start();
require_once 'dbconnect.php';

$username = 'Maria C.';
$stmt = $mysqli->prepare("SELECT id, role FROM users WHERE username = ? AND role = 'admin' AND status = 'Active'");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if ($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['username'] = $username;
    $userId = $user['id'];
    $role = $user['role'];
    echo "<script>
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userId', '" . (int)$userId . "');
        localStorage.setItem('role', '" . addslashes($role) . "');
        window.location.href = 'adminDashboard.php';
    </script>";
    exit;
}

echo "<script>alert('Default admin \"Maria C.\" not found or inactive. Create the user in the database first.'); window.location.href = 'signinTouristAdmin.html';</script>";
