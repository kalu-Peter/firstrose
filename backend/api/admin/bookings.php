<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../auth.php';

require_admin();

$db     = get_db();
$status = $_GET['status'] ?? null;

if ($status && in_array($status, ['pending', 'approved', 'rejected'], true)) {
    $stmt = $db->prepare('SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC');
    $stmt->execute([$status]);
} else {
    $stmt = $db->query('SELECT * FROM bookings ORDER BY created_at DESC');
}

$bookings = $stmt->fetchAll();
foreach ($bookings as &$b) {
    $b['deposit_paid'] = (bool) $b['deposit_paid'];
}

echo json_encode($bookings);
