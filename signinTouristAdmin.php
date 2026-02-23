<?php
session_start();
require_once 'dbconnect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    $stmt = $mysqli->prepare("SELECT id, password, role FROM users WHERE username = ? AND status = 'Active'");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            // Password is correct, start session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $username;

            // Get tourist_id if user is a tourist
            $touristId = '';
            if ($user['role'] === 'tourist') {
                $touristStmt = $mysqli->prepare("SELECT tourist_id FROM tourists WHERE user_id = ?");
                $touristStmt->bind_param("i", $user['id']);
                $touristStmt->execute();
                $touristResult = $touristStmt->get_result();
                if ($touristRow = $touristResult->fetch_assoc()) {
                    $touristId = $touristRow['tourist_id'];
                }
                $touristStmt->close();
            }

            // Redirect based on role with localStorage set
            if ($user['role'] === 'admin') {
                echo "<script>
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userId', '" . $user['id'] . "');
                    window.location.href = 'admin_dashboard.php';
                </script>";
            } else {
                echo "<script>
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userId', '" . $user['id'] . "');
                    localStorage.setItem('touristId', '" . $touristId . "');
                    window.location.href = 'landingpage.html';
                </script>";
            }
            exit();
        } else {
            echo "<script>alert('Invalid password.'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('User not found or account inactive.'); window.history.back();</script>";
    }
}
?>