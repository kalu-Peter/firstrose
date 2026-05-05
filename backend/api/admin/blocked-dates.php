<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../auth.php';

require_admin();

$db     = get_db();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list all blocks
if ($method === 'GET') {
    $stmt = $db->query(
        'SELECT * FROM blocked_dates ORDER BY check_in ASC'
    );
    echo json_encode($stmt->fetchAll());
    exit;
}

// POST — add a block
if ($method === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true) ?? [];
    $villa_id = $data['villa_id'] ?? '';
    $check_in = $data['check_in'] ?? '';
    $check_out= $data['check_out']?? '';
    $source   = $data['source']   ?? 'manual';

    if (!$villa_id || !$check_in || !$check_out || $check_in >= $check_out) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid fields']);
        exit;
    }

    $room_number = isset($data['room_number']) && $data['room_number'] !== ''
        ? (int) $data['room_number']
        : null;

    $stmt = $db->prepare(
        'INSERT INTO blocked_dates (villa_id, room_number, check_in, check_out, source, note)'
        . ' VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $villa_id,
        $room_number,
        $check_in,
        $check_out,
        $source,
        $data['note'] ?? null,
    ]);

    $new = $db->query(
        'SELECT * FROM blocked_dates WHERE id = ' . $db->lastInsertId()
    )->fetch();
    echo json_encode($new);
    exit;
}

// DELETE — remove a block
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    $db->prepare('DELETE FROM blocked_dates WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
