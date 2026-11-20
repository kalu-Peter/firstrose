<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../auth.php';

require_admin();

$db     = get_db();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list rules for a villa
if ($method === 'GET') {
    $villa_id = $_GET['villa_id'] ?? '';
    if (!$villa_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing villa_id']);
        exit;
    }
    $stmt = $db->prepare(
        'SELECT * FROM pricing_rules WHERE villa_id = ?'
        . ' ORDER BY priority ASC, start_date ASC'
    );
    $stmt->execute([$villa_id]);
    $rules = $stmt->fetchAll();
    foreach ($rules as &$r) {
        $r['price']       = (float) $r['price'];
        $r['priority']    = (int)   $r['priority'];
        $r['room_number'] = $r['room_number'] !== null ? (int) $r['room_number'] : null;
    }
    echo json_encode($rules);
    exit;
}

// POST — create a rule
if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true) ?? [];
    $villa_id   = $data['villa_id']   ?? '';
    $start_date = $data['start_date'] ?? '';
    $end_date   = $data['end_date']   ?? '';
    $price      = isset($data['price']) ? (float) $data['price'] : null;

    if (!$villa_id || !$start_date || !$end_date || $price === null || $start_date > $end_date) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid fields']);
        exit;
    }

    $room_number = isset($data['room_number']) && $data['room_number'] !== ''
        ? (int) $data['room_number'] : null;
    $label    = $data['label']    ?? null;
    $priority = isset($data['priority']) ? (int) $data['priority'] : 0;

    $stmt = $db->prepare(
        'INSERT INTO pricing_rules (villa_id, room_number, start_date, end_date, price, label, priority)'
        . ' VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$villa_id, $room_number, $start_date, $end_date, $price, $label, $priority]);

    $id  = $db->lastInsertId();
    $row = $db->query('SELECT * FROM pricing_rules WHERE id = ' . $id)->fetch();
    $row['price']       = (float) $row['price'];
    $row['priority']    = (int)   $row['priority'];
    $row['room_number'] = $row['room_number'] !== null ? (int) $row['room_number'] : null;
    echo json_encode($row);
    exit;
}

// DELETE — remove a rule
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    $db->prepare('DELETE FROM pricing_rules WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
