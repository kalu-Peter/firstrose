<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$required = ['villa_id', 'villa_name', 'guest_name', 'email', 'check_in', 'check_out', 'guests'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$db   = get_db();
$room_number = isset($data['room_number']) ? (int) $data['room_number'] : null;

$stmt = $db->prepare('
    INSERT INTO bookings (villa_id, villa_name, guest_name, email, phone, check_in, check_out, guests, message, room_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    $data['villa_id'],
    $data['villa_name'],
    $data['guest_name'],
    $data['email'],
    $data['phone']   ?? null,
    $data['check_in'],
    $data['check_out'],
    (int) $data['guests'],
    $data['message'] ?? null,
    $room_number,
]);
$booking_id = $db->lastInsertId();

// ── Notify admin ──────────────────────────────────────────────────────────────
$subject = "[" . SITE_NAME . "] New Booking Request — {$data['villa_name']}";
$body    =
    "A new booking inquiry has been received.\n\n" .
    "Booking ID : #{$booking_id}\n" .
    "Villa      : {$data['villa_name']}\n" .
    "Guest      : {$data['guest_name']}\n" .
    "Email      : {$data['email']}\n" .
    "Phone      : " . ($data['phone'] ?? 'N/A') . "\n" .
    "Check-in   : {$data['check_in']}\n" .
    "Check-out  : {$data['check_out']}\n" .
    "Guests     : {$data['guests']}\n" .
    "Message    : " . ($data['message'] ?? '—') . "\n\n" .
    "Log in to the admin panel to review and approve this booking.";

$headers =
    "From: " . FROM_EMAIL . "\r\n" .
    "Reply-To: {$data['email']}\r\n" .
    "Content-Type: text/plain; charset=UTF-8";

@mail(ADMIN_EMAIL, $subject, $body, $headers);

echo json_encode(['success' => true, 'booking_id' => (int) $booking_id]);
