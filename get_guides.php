<?php
require_once 'dbconnect.php';

header('Content-Type: application/json');

// Only Active guides; exclude suspended (punishment) until suspended_until date has passed
$col = $mysqli->query("SHOW COLUMNS FROM tour_guides LIKE 'status'");
$hasStatus = $col && $col->num_rows > 0;
$col2 = $mysqli->query("SHOW COLUMNS FROM tour_guides LIKE 'suspended_until'");
$hasSuspended = $col2 && $col2->num_rows > 0;

if ($hasStatus) {
    $query = "SELECT guide_id, first_name, last_name, profile_image, specialization, experience_years, service_areas FROM tour_guides WHERE status = 'Active'";
    if ($hasSuspended) {
        $query .= " AND (suspended_until IS NULL OR suspended_until <= CURDATE())";
    }
} else {
    $query = "SELECT guide_id, first_name, last_name, profile_image, specialization, experience_years, service_areas FROM tour_guides";
}
$result = $mysqli->query($query);

$guides = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $years = isset($row['experience_years']) ? (int)$row['experience_years'] : 0;
        $areas = isset($row['service_areas']) ? trim($row['service_areas']) : '';
        $spec = isset($row['specialization']) ? trim($row['specialization']) : '';
        $parts = [];
        if ($spec) $parts[] = $spec;
        if ($years > 0) $parts[] = $years . ' ' . ($years === 1 ? 'year' : 'years') . ' experience';
        if ($areas !== '') $parts[] = $areas;
        $description = count($parts) > 0 ? implode(' · ', $parts) : 'Experienced tour guide.';
        $guides[] = [
            'guide_id' => (int) ($row['guide_id'] ?? 0),
            'name' => trim($row['first_name'] . ' ' . $row['last_name']),
            'description' => $description,
            'image' => !empty($row['profile_image']) ? $row['profile_image'] : 'photos/default.jpg'
        ];
    }
}

echo json_encode($guides);
?>