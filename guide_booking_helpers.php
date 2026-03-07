<?php

function guide_bookings_column_exists(mysqli $mysqli, $table, $column)
{
    $table = $mysqli->real_escape_string($table);
    $column = $mysqli->real_escape_string($column);
    $result = $mysqli->query("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");
    return $result && $result->num_rows > 0;
}

function ensure_guide_bookings_table(mysqli $mysqli)
{
    $sql = "CREATE TABLE IF NOT EXISTS guide_bookings (
        booking_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        tourist_user_id INT UNSIGNED NOT NULL,
        guide_id INT UNSIGNED NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME NULL DEFAULT NULL,
        INDEX idx_guide_bookings_status (status),
        INDEX idx_guide_bookings_guide (guide_id),
        INDEX idx_guide_bookings_tourist (tourist_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$mysqli->query($sql)) {
        return false;
    }

    if (!guide_bookings_column_exists($mysqli, 'guide_bookings', 'approved_at')) {
        $mysqli->query("ALTER TABLE guide_bookings ADD COLUMN approved_at DATETIME NULL DEFAULT NULL AFTER created_at");
    }

    return !$mysqli->error;
}

function get_tourist_by_user_id(mysqli $mysqli, $userId)
{
    $stmt = $mysqli->prepare("SELECT tourist_id, first_name, last_name FROM tourists WHERE user_id = ? LIMIT 1");
    if (!$stmt) {
        return null;
    }
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();
    return $row ?: null;
}

function get_guide_id_by_user_id(mysqli $mysqli, $userId)
{
    $stmt = $mysqli->prepare("SELECT guide_id FROM tour_guides WHERE user_id = ? LIMIT 1");
    if (!$stmt) {
        return 0;
    }
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();
    return $row ? (int) $row['guide_id'] : 0;
}
?>
