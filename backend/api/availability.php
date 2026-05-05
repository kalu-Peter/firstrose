<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$villa_id  = $_GET['villa_id']  ?? '';
$check_in  = $_GET['check_in']  ?? '';
$check_out = $_GET['check_out'] ?? '';

if (!$villa_id || !$check_in || !$check_out) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required params']);
    exit;
}

if ($check_in >= $check_out) {
    http_response_code(400);
    echo json_encode(['error' => 'check_out must be after check_in']);
    exit;
}

$db       = get_db();
$approved = 'approved';

if ($villa_id === '3bed-upper-floor') {
    $stmt = $db->prepare(
        'SELECT DISTINCT room_number FROM bookings'
        . ' WHERE villa_id = ? AND (status = ? OR deposit_paid = 1)'
        . ' AND room_number IS NOT NULL AND check_in < ? AND check_out > ?'
    );
    $stmt->execute([$villa_id, $approved, $check_out, $check_in]);
    $booked    = array_map('intval', array_column($stmt->fetchAll(), 'room_number'));
    $all       = [1, 2, 3];
    $available = array_values(array_diff($all, $booked));

    echo json_encode([
        'villa_id'        => $villa_id,
        'total_rooms'     => 3,
        'available_rooms' => $available,
        'booked_rooms'    => array_values($booked),
        'available_count' => count($available),
        'fully_blocked'   => count($available) === 0,
    ]);
} else {
    $stmt = $db->prepare(
        'SELECT COUNT(*) AS cnt FROM bookings'
        . ' WHERE villa_id = ? AND (status = ? OR deposit_paid = 1)'
        . ' AND check_in < ? AND check_out > ?'
    );
    $stmt->execute([$villa_id, $approved, $check_out, $check_in]);
    $available = (int) $stmt->fetch()['cnt'] === 0;

    echo json_encode([
        'villa_id'        => $villa_id,
        'total_rooms'     => 1,
        'available_rooms' => $available ? [1] : [],
        'available_count' => $available ? 1 : 0,
        'fully_blocked'   => !$available,
    ]);
}
