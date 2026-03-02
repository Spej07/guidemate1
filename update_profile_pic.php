<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'dbconnect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $role = $_POST['role'] ?? '';

    if (empty($user_id) || empty($role)) {
        die("<script>alert('Invalid request.'); window.location.href = 'signinTouristAdmin.html';</script>");
    }

    // Handle file upload
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['profile_image'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowed_types)) {
            die("<script>alert('Invalid file type.'); window.history.back();</script>");
        }
        if ($file['size'] > 2 * 1024 * 1024) { // 2MB
            die("<script>alert('File too large.'); window.history.back();</script>");
        }

        // Generate unique filename
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
        $upload_dir = __DIR__ . '/photos/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $upload_path = $upload_dir . $filename;
        $db_path = 'photos/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $upload_path)) {
            // Update DB based on role
            $table = '';
            $column = 'profile_image';
            if ($role === 'admin') {
                $table = 'admins';
            } elseif ($role === 'guide') {
                $table = 'tour_guides';
            } elseif ($role === 'tourist') {
                $table = 'tourists';
            } else {
                die("<script>alert('Invalid role.'); window.location.href = 'signinTouristAdmin.html';</script>");
            }

            $stmt = $mysqli->prepare("UPDATE $table SET $column = ? WHERE user_id = ?");
            $stmt->bind_param('si', $db_path, $user_id);
            if ($stmt->execute()) {
                echo "<script>
                    localStorage.setItem('profileImage', '$db_path');
                    alert('Profile picture updated!');
                    window.location.href = 'signinTouristAdmin.html';
                </script>";
            } else {
                echo "<script>alert('Error updating profile.'); window.history.back();</script>";
            }
        } else {
            echo "<script>alert('Upload failed.'); window.history.back();</script>";
        }
    } else {
        // No file uploaded, perhaps skip
        echo "<script>alert('No file uploaded.'); window.location.href = 'signinTouristAdmin.html';</script>";
    }
}
?>