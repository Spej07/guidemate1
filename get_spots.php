<?php
/**
 * Returns tourist spots (destinations) for tourist-facing pages and navigation.
 */
require_once 'dbconnect.php';

header('Content-Type: application/json');

$col = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'image'");
$hasImage = $col && $col->num_rows > 0;
$col2 = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'rating'");
$hasRating = $col2 && $col2->num_rows > 0;
$colAddress = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'address'");
$hasAddress = $colAddress && $colAddress->num_rows > 0;
$col3 = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'latitude'");
$hasLatitude = $col3 && $col3->num_rows > 0;
$col4 = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'longitude'");
$hasLongitude = $col4 && $col4->num_rows > 0;
$colFacilities = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'facilities_services'");
$hasFacilities = $colFacilities && $colFacilities->num_rows > 0;
$colContact = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'contact_information'");
$hasContact = $colContact && $colContact->num_rows > 0;
$colCategory = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'categorization'");
$hasCategory = $colCategory && $colCategory->num_rows > 0;
$colMostVisited = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'is_most_visited'");
$hasMostVisited = $colMostVisited && $colMostVisited->num_rows > 0;
$colAvailability = $mysqli->query("SHOW COLUMNS FROM destinations LIKE 'is_available'");
$hasAvailability = $colAvailability && $colAvailability->num_rows > 0;

$select = "destination_id, name, description";
if ($hasAddress) $select .= ", address";
if ($hasImage) $select .= ", image";
if ($hasRating) $select .= ", rating, review_count, price";
if ($hasLatitude && $hasLongitude) $select .= ", latitude, longitude";
if ($hasFacilities) $select .= ", facilities_services";
if ($hasContact) $select .= ", contact_information";
if ($hasCategory) $select .= ", categorization";
if ($hasMostVisited) $select .= ", is_most_visited";

$query = "SELECT $select FROM destinations";
if ($hasAvailability) {
    $query .= " WHERE is_available = 1";
}
$query .= " ORDER BY created_at DESC";
$result = $mysqli->query($query);

$spots = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $img = null;
        if ($hasImage && !empty($row['image'])) {
            $img = $row['image'];
        } else {
            $id = (int) $row['destination_id'];
            $ph = $mysqli->query("SELECT photo_url FROM destination_photos WHERE destination_id = $id LIMIT 1");
            if ($ph && $ph->num_rows > 0) {
                $r = $ph->fetch_assoc();
                $img = $r['photo_url'];
            }
        }
        $spots[] = [
            'destinationId' => (int) $row['destination_id'],
            'name' => $row['name'],
            'description' => $row['description'] ?: '',
            'address' => ($hasAddress && isset($row['address'])) ? ($row['address'] ?: '') : '',
            'image' => $img ?: 'photos/default.jpg',
            'rating' => ($hasRating && isset($row['rating'])) ? (float) $row['rating'] : 4.5,
            'reviewCount' => ($hasRating && isset($row['review_count'])) ? (int) $row['review_count'] : 0,
            'price' => ($hasRating && isset($row['price']) && $row['price'] !== null && $row['price'] !== '') ? $row['price'] : '—',
            'latitude' => ($hasLatitude && isset($row['latitude']) && $row['latitude'] !== null) ? (float) $row['latitude'] : null,
            'longitude' => ($hasLongitude && isset($row['longitude']) && $row['longitude'] !== null) ? (float) $row['longitude'] : null,
            'facilitiesServices' => ($hasFacilities && isset($row['facilities_services'])) ? ($row['facilities_services'] ?: '') : '',
            'contactInformation' => ($hasContact && isset($row['contact_information'])) ? ($row['contact_information'] ?: '') : '',
            'categorization' => ($hasCategory && isset($row['categorization'])) ? ($row['categorization'] ?: '') : '',
            'isMostVisited' => ($hasMostVisited && isset($row['is_most_visited'])) ? (bool) $row['is_most_visited'] : false,
        ];
    }
}

echo json_encode($spots);
