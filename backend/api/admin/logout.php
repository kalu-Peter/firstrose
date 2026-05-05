<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../auth.php';

require_admin();

preg_match('/^Bearer\s+(\S+)$/i', $_SERVER['HTTP_AUTHORIZATION'] ?? '', $m);
get_db()->prepare('DELETE FROM admin_tokens WHERE token = ?')->execute([$m[1]]);

echo json_encode(['success' => true]);
