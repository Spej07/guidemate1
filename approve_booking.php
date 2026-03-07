<?php
session_start();
require_once 'dbconnect.php';
require_once 'guide_booking_helpers.php';

header('Content-Type: application/json');

if (empty($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

if (!ensure_guide_bookings_table($mysqli)) {
    echo json_encode(['ok' => false, 'error' => 'Could not prepare bookings table.']);
    exit;
}

$booking_id = isset($_POST['booking_id']) ? (int) $_POST['booking_id'] : 0;
if ($booking_id <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Invalid booking_id']);
    exit;
}

try {
    $mysqli->begin_transaction();

    $selectStmt = $mysqli->prepare("SELECT booking_id, guide_id FROM guide_bookings WHERE booking_id = ? AND status = 'Pending' FOR UPDATE");
    $selectStmt->bind_param('i', $booking_id);
    $selectStmt->execute();
    $selectResult = $selectStmt->get_result();
    $booking = $selectResult ? $selectResult->fetch_assoc() : null;
    $selectStmt->close();

    if (!$booking) {
        $mysqli->rollback();
        echo json_encode(['ok' => false, 'error' => 'Booking not found or already approved.']);
        exit;
    }

    $guide_id = (int) $booking['guide_id'];

    $occupiedStmt = $mysqli->prepare("SELECT booking_id FROM guide_bookings WHERE guide_id = ? AND status = 'Approved' LIMIT 1 FOR UPDATE");
    $occupiedStmt->bind_param('i', $guide_id);
    $occupiedStmt->execute();
    $occupiedResult = $occupiedStmt->get_result();
    $occupied = $occupiedResult ? $occupiedResult->fetch_assoc() : null;
    $occupiedStmt->close();

    if ($occupied) {
        $mysqli->rollback();
        echo json_encode(['ok' => false, 'error' => 'This guide already has an approved booking.']);
        exit;
    }

    $updateStmt = $mysqli->prepare("UPDATE guide_bookings SET status = 'Approved', approved_at = NOW() WHERE booking_id = ? AND status = 'Pending'");
    $updateStmt->bind_param('i', $booking_id);
    $updateStmt->execute();
    $updated = $updateStmt->affected_rows > 0;
    $updateStmt->close();

    if (!$updated) {
        $mysqli->rollback();
        echo json_encode(['ok' => false, 'error' => 'Could not approve this booking.']);
        exit;
    }

    $mysqli->commit();
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    $mysqli->rollback();
    echo json_encode(['ok' => false, 'error' => 'Approval failed.']);
}
?>
