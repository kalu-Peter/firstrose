<?php
require_once __DIR__ . '/db.php';

function get_auth_header(): string {
    // Apache often strips Authorization from $_SERVER — check apache_request_headers() too
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('apache_request_headers')) {
        $h = apache_request_headers();
        return $h['Authorization'] ?? $h['authorization'] ?? '';
    }
    return '';
}

function require_admin(): void {
    $header = get_auth_header();
    if (!preg_match('/^Bearer\s+(\S+)$/i', $header, $m)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $token = $m[1];
    $stmt  = get_db()->prepare(
        'SELECT id FROM admin_tokens WHERE token = ? AND expires_at > NOW()'
    );
    $stmt->execute([$token]);
    if (!$stmt->fetch()) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired session']);
        exit;
    }
}
