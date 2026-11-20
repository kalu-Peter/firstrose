<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$villa_id = $_GET['villa_id'] ?? '';
$month    = $_GET['month']    ?? date('Y-m');   // e.g. "2026-05"

if (!$villa_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing villa_id']);
    exit;
}

// Fetch rules that overlap the requested month
$start = $month . '-01';
$end   = date('Y-m-t', strtotime($start));   // last day of month

$db   = get_db();
$stmt = $db->prepare(
    'SELECT * FROM pricing_rules'
    . ' WHERE villa_id = ? AND start_date <= ? AND end_date >= ?'
    . ' ORDER BY priority ASC, start_date ASC'
);
$stmt->execute([$villa_id, $end, $start]);

$rules = $stmt->fetchAll();
foreach ($rules as &$r) {
    $r['price']       = (float) $r['price'];
    $r['priority']    = (int)   $r['priority'];
    $r['room_number'] = $r['room_number'] !== null ? (int) $r['room_number'] : null;
}

echo json_encode($rules);
