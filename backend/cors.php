<?php
// Suppress HTML error output — errors must come back as JSON
ini_set('display_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

// Convert any PHP error/warning into a JSON response
set_error_handler(function (int $errno, string $errstr, string $errfile, int $errline): bool {
    if (!(error_reporting() & $errno)) return false;
    http_response_code(500);
    echo json_encode(['error' => $errstr, 'file' => basename($errfile), 'line' => $errline]);
    exit;
});

// Catch fatal errors (parse errors, missing includes, etc.)
register_shutdown_function(function (): void {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        http_response_code(500);
        echo json_encode(['error' => $e['message'], 'file' => basename($e['file']), 'line' => $e['line']]);
    }
});

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
