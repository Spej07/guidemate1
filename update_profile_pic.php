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

        // Tour guides: 1 profile pic change per 30 days
        if ($role === 'guide') {
            $col = $mysqli->query("SHOW COLUMNS FROM tour_guides LIKE 'profile_image_updated_at'");
            if (!$col || $col->num_rows === 0) {
                $mysqli->query("ALTER TABLE tour_guides ADD COLUMN profile_image_updated_at DATE DEFAULT NULL");
            }
            $stmtCheck = $mysqli->prepare("SELECT profile_image_updated_at FROM tour_guides WHERE user_id = ?");
            $stmtCheck->bind_param('i', $user_id);
            $stmtCheck->execute();
            $res = $stmtCheck->get_result();
            if ($res && ($row = $res->fetch_assoc()) && !empty($row['profile_image_updated_at'])) {
                $last = (string)$row['profile_image_updated_at'];
                $lastTs = strtotime($last);
                $nextAllowed = strtotime('+30 days', $lastTs);
                if (time() < $nextAllowed) {
                    $nextDate = date('F j, Y', $nextAllowed);
                    die("<script>alert('You can only change your profile picture once every 30 days. Next change allowed on " . addslashes($nextDate) . ".'); window.history.back();</script>");
                }
            }
            $stmtCheck->close();
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

            if ($role === 'guide') {
                $stmt = $mysqli->prepare("UPDATE tour_guides SET profile_image = ?, profile_image_updated_at = CURDATE() WHERE user_id = ?");
                $stmt->bind_param('si', $db_path, $user_id);
            } else {
                $stmt = $mysqli->prepare("UPDATE $table SET $column = ? WHERE user_id = ?");
                $stmt->bind_param('si', $db_path, $user_id);
            }
            if ($stmt->execute()) {
                $redirect = ($role === 'guide') ? 'tourGuideDashboardNew.html' : 'signinTouristAdmin.html';
                $db_path_esc = addslashes($db_path);
                $guideIdScript = '';
                $cooldownJustChangedScript = '';
                if ($role === 'guide') {
                    $gRes = $mysqli->query("SELECT guide_id FROM tour_guides WHERE user_id = " . (int)$user_id);
                    if ($gRes && $gRow = $gRes->fetch_assoc()) {
                        $guideIdScript = "localStorage.setItem('guideId', '" . (int)$gRow['guide_id'] . "');";
                    }
                    // Show the "1 change per 30 days" note only once (right after successful change)
                    $cooldownJustChangedScript = "localStorage.setItem('showProfilePicCooldownNote', '1');";
                }
                echo "<script>
                    localStorage.setItem('profileImage:$role:$user_id', '$db_path_esc');
                    localStorage.setItem('profileImage', '$db_path_esc');
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userId', '$user_id');
                    localStorage.setItem('role', '$role');
                    $guideIdScript
                    $cooldownJustChangedScript
                    alert('Profile picture updated!');
                    window.location.href = '$redirect';
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