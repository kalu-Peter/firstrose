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

// Check if the whole villa is externally blocked (room_number IS NULL)
$ext_full = $db->prepare(
    'SELECT COUNT(*) AS cnt FROM blocked_dates'
    . ' WHERE villa_id = ? AND room_number IS NULL'
    . ' AND check_in < ? AND check_out > ?'
);
$ext_full->execute([$villa_id, $check_out, $check_in]);
$villa_fully_blocked = (int) $ext_full->fetch()['cnt'] > 0;

if ($villa_fully_blocked) {
    echo json_encode([
        'villa_id'        => $villa_id,
        'total_rooms'     => $villa_id === '3bed-upper-floor' ? 3 : 1,
        'available_rooms' => [],
        'booked_rooms'    => $villa_id === '3bed-upper-floor' ? [1, 2, 3] : [1],
        'available_count' => 0,
        'fully_blocked'   => true,
    ]);
    exit;
}

if ($villa_id === '3bed-upper-floor') {
    // Rooms blocked by confirmed bookings
    $s1 = $db->prepare(
        'SELECT DISTINCT room_number FROM bookings'
        . ' WHERE villa_id = ? AND (status = ? OR deposit_paid = 1)'
        . ' AND room_number IS NOT NULL AND check_in < ? AND check_out > ?'
    );
    $s1->execute([$villa_id, $approved, $check_out, $check_in]);
    $from_bookings = array_map('intval', array_column($s1->fetchAll(), 'room_number'));

    // Rooms blocked by external sources (specific room blocks)
    $s2 = $db->prepare(
        'SELECT DISTINCT room_number FROM blocked_dates'
        . ' WHERE villa_id = ? AND room_number IS NOT NULL'
        . ' AND check_in < ? AND check_out > ?'
    );
    $s2->execute([$villa_id, $check_out, $check_in]);
    $from_external = array_map('intval', array_column($s2->fetchAll(), 'room_number'));

    $booked    = array_values(array_unique(array_merge($from_bookings, $from_external)));
    $available = array_values(array_diff([1, 2, 3], $booked));

    echo json_encode([
        'villa_id'        => $villa_id,
        'total_rooms'     => 3,
        'available_rooms' => $available,
        'booked_rooms'    => $booked,
        'available_count' => count($available),
        'fully_blocked'   => count($available) === 0,
    ]);
} else {
    // Confirmed bookings
    $s1 = $db->prepare(
        'SELECT COUNT(*) AS cnt FROM bookings'
        . ' WHERE villa_id = ? AND (status = ? OR deposit_paid = 1)'
        . ' AND check_in < ? AND check_out > ?'
    );
    $s1->execute([$villa_id, $approved, $check_out, $check_in]);
    $booking_block = (int) $s1->fetch()['cnt'] > 0;

    // External blocks (specific room)
    $s2 = $db->prepare(
        'SELECT COUNT(*) AS cnt FROM blocked_dates'
        . ' WHERE villa_id = ? AND check_in < ? AND check_out > ?'
    );
    $s2->execute([$villa_id, $check_out, $check_in]);
    $external_block = (int) $s2->fetch()['cnt'] > 0;

    $available = !$booking_block && !$external_block;

    echo json_encode([
        'villa_id'        => $villa_id,
        'total_rooms'     => 1,
        'available_rooms' => $available ? [1] : [],
        'available_count' => $available ? 1 : 0,
        'fully_blocked'   => !$available,
    ]);
}
