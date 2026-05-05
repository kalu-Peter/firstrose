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

// Default prices — must match villas.ts
$defaults = [
    '3bed-upper-floor' => 3300.00,
    '2bed-pool-house'  => 10000.00,
];

if (!isset($defaults[$villa_id])) {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown villa']);
    exit;
}

$default_price = $defaults[$villa_id];

// Fetch rules that overlap the booking range (whole-villa rules, room_number IS NULL)
$db   = get_db();
$stmt = $db->prepare(
    'SELECT * FROM pricing_rules'
    . ' WHERE villa_id = ? AND room_number IS NULL'
    . ' AND start_date <= ? AND end_date >= ?'
    . ' ORDER BY priority DESC, start_date ASC'
);
$stmt->execute([$villa_id, $check_out, $check_in]);
$rules = $stmt->fetchAll();
foreach ($rules as &$r) { $r['price'] = (float) $r['price']; }

// Build day-by-day pricing (check_out night is NOT charged)
$daily  = [];
$cursor = new DateTime($check_in);
$end    = new DateTime($check_out);

while ($cursor < $end) {
    $date_str = $cursor->format('Y-m-d');
    $price    = $default_price;
    $label    = null;

    foreach ($rules as $rule) {
        if ($rule['start_date'] <= $date_str && $rule['end_date'] >= $date_str) {
            $price = $rule['price'];
            $label = $rule['label'];
            break; // highest priority first
        }
    }

    $daily[] = ['date' => $date_str, 'price' => $price, 'label' => $label];
    $cursor->modify('+1 day');
}

$total  = array_sum(array_column($daily, 'price'));
$nights = count($daily);

echo json_encode([
    'villa_id'     => $villa_id,
    'nights'       => $nights,
    'total_price'  => $total,
    'daily_prices' => $daily,
    'currency'     => 'KSH',
]);
