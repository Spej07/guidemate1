<?php
session_start();
require_once 'dbconnect.php'; // Using your project's connection file

// #region agent log
function _debug_log($data) {
    $payload = array_merge(['sessionId'=>'4384f2','timestamp'=>round(microtime(true)*1000),'location'=>'signinTouristAdmin.php'], $data);
    @file_put_contents(__DIR__ . '/debug-4384f2.log', json_encode($payload) . "\n", FILE_APPEND | LOCK_EX);
}
// #endregion

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    // #region agent log
    _debug_log(['message'=>'POST received','data'=>['username'=>$username,'username_len'=>strlen($username),'has_password'=>strlen($password)>0],'hypothesisId'=>'H3,H4']);
    // #endregion

    // 1. Fetch user details
    $stmt = $mysqli->prepare("SELECT id, password, role FROM users WHERE username = ? AND status = 'Active'");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    // #region agent log
    $userByUsername = null;
    $stmtDebug = $mysqli->prepare("SELECT id, role, status FROM users WHERE username = ?");
    if ($stmtDebug) { $stmtDebug->bind_param("s", $username); $stmtDebug->execute(); $resDebug = $stmtDebug->get_result(); $userByUsername = $resDebug->fetch_assoc(); $stmtDebug->close(); }
    _debug_log(['message'=>'lookup result','data'=>['active_row_found'=>($result->num_rows > 0),'user_by_username'=>$userByUsername],'hypothesisId'=>'H1,H2,H5']);
    // #endregion

    if ($user = $result->fetch_assoc()) {
        $userId = $user['id'];
        $role = $user['role'];
        $hashedPassword = $user['password'];

        // 2. DEFAULT ADMIN BYPASS LOGIC
        // If username is "Maria C." and database role is admin, skip password check
        $isAdminDefault = ($username === "Maria C." && $role === 'admin');
        $isPasswordCorrect = password_verify($password, $hashedPassword);

        if ($isAdminDefault || $isPasswordCorrect) {
            
            // 3. Set Session variables for server-side security
            $_SESSION['user_id'] = $userId;
            $_SESSION['role'] = $role;
            $_SESSION['username'] = $username;

            $specificId = ''; 

            // 4. Retrieve specific IDs for Tourists or Guides
            if ($role === 'tourist') {
                $tStmt = $mysqli->prepare("SELECT tourist_id, profile_image FROM tourists WHERE user_id = ?");
                $tStmt->bind_param("i", $userId);
                $tStmt->execute();
                $tRes = $tStmt->get_result();
                $touristProfileImage = 'photos/default.jpg';
                if ($row = $tRes->fetch_assoc()) {
                    $specificId = $row['tourist_id'];
                    if (!empty($row['profile_image'])) {
                        $touristProfileImage = addslashes($row['profile_image']);
                    }
                }
                $tStmt->close();
            } elseif ($role === 'guide') {
                $gStmt = $mysqli->prepare("SELECT guide_id, profile_image FROM tour_guides WHERE user_id = ?");
                $gStmt->bind_param("i", $userId);
                $gStmt->execute();
                $gRes = $gStmt->get_result();
                $guideProfileImage = 'photos/default.jpg';
                if ($row = $gRes->fetch_assoc()) {
                    $specificId = $row['guide_id'];
                    if (!empty($row['profile_image'])) {
                        $guideProfileImage = addslashes($row['profile_image']);
                    }
                }
                $gStmt->close();
            }

            // 5. Redirection Logic
            echo "<script>
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userId', '$userId');
                localStorage.setItem('role', '$role');";

            if ($role === 'admin') {
                echo "window.location.href = 'adminDashboard.php';";
            } elseif ($role === 'guide') {
                echo "localStorage.setItem('guideId', '$specificId');
                      localStorage.setItem('profileImage:guide:$userId', '$guideProfileImage');
                      localStorage.setItem('profileImage', '$guideProfileImage');
                      window.location.href = 'tourGuideDashboardNew.html';";
            } else {
                echo "localStorage.setItem('touristId', '$specificId');
                      localStorage.setItem('profileImage:tourist:$userId', '$touristProfileImage');
                      localStorage.setItem('profileImage', '$touristProfileImage');
                      window.location.href = 'landingpage.html';";
            }
            
            echo "</script>";
            exit();

        } else {
            echo "<script>alert('Invalid password.'); window.history.back();</script>";
        }
    } else {
        // #region agent log
        _debug_log(['message'=>'Account not found or inactive branch','data'=>['username'=>$username],'hypothesisId'=>'H1,H2']);
        // #endregion
        echo "<script>alert('Account not found or inactive.'); window.history.back();</script>";
    }
}
?>