<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../auth.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = (int) ($data['id']     ?? 0);
$action = $data['action'] ?? '';

if (!$id || !$action) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id or action']);
    exit;
}

$db   = get_db();
$stmt = $db->prepare('SELECT * FROM bookings WHERE id = ?');
$stmt->execute([$id]);
$booking = $stmt->fetch();

if (!$booking) {
    http_response_code(404);
    echo json_encode(['error' => 'Booking not found']);
    exit;
}

switch ($action) {
    case 'approve':
        $db->prepare('UPDATE bookings SET status = ? WHERE id = ?')->execute(['approved', $id]);

        $subject = "Your Booking is Confirmed — " . SITE_NAME;
        $body    =
            "Dear {$booking['guest_name']},\n\n" .
            "Great news — your booking has been confirmed!\n\n" .
            "Villa     : {$booking['villa_name']}\n" .
            "Check-in  : {$booking['check_in']}\n" .
            "Check-out : {$booking['check_out']}\n" .
            "Guests    : {$booking['guests']}\n\n" .
            "Please reach out if you have any questions.\n\n" .
            "— The " . SITE_NAME . " Team";
        $headers = "From: " . FROM_EMAIL . "\r\nContent-Type: text/plain; charset=UTF-8";
        @mail($booking['email'], $subject, $body, $headers);
        break;

    case 'reject':
        $db->prepare('UPDATE bookings SET status = ? WHERE id = ?')->execute(['rejected', $id]);

        $subject = "Booking Update — " . SITE_NAME;
        $body    =
            "Dear {$booking['guest_name']},\n\n" .
            "Unfortunately we're unable to confirm your booking for {$booking['villa_name']} " .
            "on the requested dates. Please contact us to explore alternatives.\n\n" .
            "— The " . SITE_NAME . " Team";
        $headers = "From: " . FROM_EMAIL . "\r\nContent-Type: text/plain; charset=UTF-8";
        @mail($booking['email'], $subject, $body, $headers);
        break;

    case 'toggle_deposit':
        $new = $booking['deposit_paid'] ? 0 : 1;
        $db->prepare('UPDATE bookings SET deposit_paid = ? WHERE id = ?')->execute([$new, $id]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action']);
        exit;
}

$stmt->execute([$id]);
$updated = $stmt->fetch();
$updated['deposit_paid'] = (bool) $updated['deposit_paid'];
echo json_encode($updated);
