<?php
/**
 * Shared helpers for parsing and formatting review records.
 */

function gm_parse_review_comment($rawComment) {
    $rawComment = (string)$rawComment;
    $locationName = '';
    $displayComment = $rawComment;
    $reviewType = 'location';

    if (preg_match('/^Type:\s*(location|guide)\RLocation:\s*(.+?)\RReview:\s*(.*)$/si', $rawComment, $matches)) {
        $reviewType = strtolower(trim($matches[1]));
        $locationName = trim($matches[2]);
        $displayComment = trim($matches[3]);
    } elseif (preg_match('/^Location:\s*(.+?)\RReview:\s*(.*)$/s', $rawComment, $matches)) {
        $locationName = trim($matches[1]);
        $displayComment = trim($matches[2]);
    }

    return [
        'review_type' => $reviewType,
        'location_name' => $locationName,
        'comment' => $displayComment,
        'raw_comment' => $rawComment,
    ];
}

function gm_review_subject($guideName, $locationName) {
    $guideName = trim((string)$guideName);
    $locationName = trim((string)$locationName);
    if ($guideName === '') {
        return $locationName !== '' ? $locationName : '—';
    }
    if ($locationName === '') {
        return $guideName;
    }
    return $guideName . ' @ ' . $locationName;
}
