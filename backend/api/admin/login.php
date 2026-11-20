<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../db.php';

$creds = __DIR__ . '/../../admin_credentials.php';
if (!file_exists($creds)) {
    http_response_code(503);
    echo json_encode(['error' => 'Admin not configured. Run setup.php first.']);
    exit;
}
require_once $creds;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true) ?? [];
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if ($username !== ADMIN_USERNAME || !password_verify($password, ADMIN_PASSWORD_HASH)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+' . TOKEN_EXPIRY_HOURS . ' hours'));

$db = get_db();
$db->exec('DELETE FROM admin_tokens WHERE expires_at <= NOW()');
$db->prepare('INSERT INTO admin_tokens (token, expires_at) VALUES (?, ?)')->execute([$token, $expires]);

echo json_encode(['token' => $token, 'expires_at' => $expires]);
