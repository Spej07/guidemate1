<?php
require_once 'dbconnect.php'; 

function handleError($mysqli, $message) {
    if ($mysqli && $mysqli->connect_errno === 0) {
        $mysqli->rollback();
    }
    die("<script>alert('" . addslashes($message) . "'); window.history.back();</script>");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name  = trim($_POST['last_name'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $contact    = trim($_POST['contact'] ?? '');
    $username   = trim($_POST['username'] ?? '');
    $password   = $_POST['password'] ?? '';
    $role       = $_POST['role'] ?? 'tourist'; // 'tourist' or 'admin'

    if (empty($username) || empty($password) || empty($email)) {
        handleError($mysqli, "Please fill in all required fields.");
    }

    // Check if username already exists
    $checkUser = $mysqli->prepare("SELECT username FROM users WHERE username = ?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    if ($checkUser->get_result()->num_rows > 0) {
        handleError($mysqli, "Username is already taken.");
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $mysqli->begin_transaction();

    try {
        // 1. Insert into users table
        $stmt1 = $mysqli->prepare("INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, 'Active')");
        $stmt1->bind_param('sss', $username, $hashed_password, $role);
        $stmt1->execute();
        $user_id = $mysqli->insert_id;

        // 2. Role-based insertion
        if ($role === 'admin') {
            // Assuming you have an 'admins' table
            $stmt2 = $mysqli->prepare("INSERT INTO admins (user_id, first_name, last_name, email) VALUES (?, ?, ?, ?)");
            $stmt2->bind_param('isss', $user_id, $first_name, $last_name, $email);
        } else {
            // Insert into tourists table
            $stmt2 = $mysqli->prepare("INSERT INTO tourists (user_id, first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?, ?)");
            $stmt2->bind_param('issss', $user_id, $first_name, $last_name, $email, $contact);
        }
        
        $stmt2->execute();
        $mysqli->commit();

        echo "<script>
                alert('Registration successful! Welcome to GuideMate.');
                window.location.href = 'signinTouristAdmin.html';
              </script>";

    } catch (Exception $e) {
        $mysqli->rollback();
        handleError($mysqli, "Error during registration: " . $e->getMessage());
    }
}
?>