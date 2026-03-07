<?php
/**
 * One-time setup: creates the default admin user "Maria C." in the database.
 * Run this once in the browser (e.g. http://localhost/guidemate1/create_admin_user.php)
 * then delete or restrict access to this file for security.
 */
require_once 'dbconnect.php';

$username = 'Maria C.';
$password = 'admin123'; // change if you want a real password (used only if bypass is removed later)
$role     = 'admin';
$status   = 'Active';

// Check if admin already exists
$stmt = $mysqli->prepare("SELECT id FROM users WHERE username = ? AND role = 'admin'");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if ($result->num_rows > 0) {
    echo "<p><strong>Admin user \"{$username}\" already exists.</strong> You can sign in on the sign-in page (password optional for this admin).</p>";
    echo "<p><a href='signinTouristAdmin.html'>Go to Sign In</a></p>";
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$insert = $mysqli->prepare("INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)");
$insert->bind_param('ssss', $username, $hashedPassword, $role, $status);

if ($insert->execute()) {
    $insert->close();
    echo "<p><strong>Admin user \"{$username}\" created successfully.</strong></p>";
    echo "<p>You can now sign in at the sign-in page with username <strong>Maria C.</strong> (password optional, or use: {$password}).</p>";
    echo "<p><a href='signinTouristAdmin.html'>Go to Sign In</a></p>";
    echo "<p style='color:#666;font-size:0.9em;'>For security, delete or protect <code>create_admin_user.php</code> after use.</p>";
} else {
    $insert->close();
    echo "<p>Error creating admin: " . htmlspecialchars($mysqli->error) . "</p>";
    echo "<p>Check that the <code>users</code> table exists and has columns: username, password, role, status.</p>";
}
