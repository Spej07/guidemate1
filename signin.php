<?php
session_start();
require_once 'dbconnect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // Fetch user and role
    $stmt = $mysqli->prepare("SELECT id, password, role FROM users WHERE username = ? AND status = 'Active'");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            // Password is correct, set Session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $username;

            $role = $user['role'];
            $specificId = '';

            // 1. If Tourist, get tourist_id
            if ($role === 'tourist') {
                $tStmt = $mysqli->prepare("SELECT tourist_id FROM tourists WHERE user_id = ?");
                $tStmt->bind_param("i", $user['id']);
                $tStmt->execute();
                $tRes = $tStmt->get_result();
                if ($tRow = $tRes->fetch_assoc()) $specificId = $tRow['tourist_id'];
                $tStmt->close();
            } 
            // 2. If Guide, get guide_id
            elseif ($role === 'guide') {
                $gStmt = $mysqli->prepare("SELECT guide_id FROM tour_guides WHERE user_id = ?");
                $gStmt->bind_param("i", $user['id']);
                $gStmt->execute();
                $gRes = $gStmt->get_result();
                if ($gRow = $gRes->fetch_assoc()) $specificId = $gRow['guide_id'];
                $gStmt->close();
            }

            // 3. Handle JavaScript LocalStorage and Redirection
            echo "<script>
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userId', '" . $user['id'] . "');
                localStorage.setItem('role', '" . $role . "');";

            if ($role === 'admin') {
                echo "window.location.href = 'admin_dashboard.php';";
            } elseif ($role === 'guide') {
                echo "localStorage.setItem('guideId', '" . $specificId . "');
                      window.location.href = 'tourGuideDashboardNew.html';";
            } else {
                echo "localStorage.setItem('touristId', '" . $specificId . "');
                      window.location.href = 'landingpage.html';";
            }
            echo "</script>";
            exit();

        } else {
            echo "<script>alert('Invalid password.'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('User not found or account inactive.'); window.history.back();</script>";
    }
}
?>