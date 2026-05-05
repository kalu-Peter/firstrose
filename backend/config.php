<?php

// ── Database ──────────────────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'firstrose_db');
define('DB_USER', 'root');         // ← change for production
define('DB_PASS', '');             // ← change for production

// ── Email ─────────────────────────────────────────────────────────────────────
define('ADMIN_EMAIL', 'peterkalu41@gmail.com');
define('FROM_EMAIL',  'bookings@firstrosevilla.com');
define('SITE_NAME',   'Firstrose Villa');

// ── CORS ──────────────────────────────────────────────────────────────────────
// Set to your frontend origin (no trailing slash)
define('CORS_ORIGIN', getenv('FRONTEND_URL') ?: 'http://localhost:8080');

// ── Admin session ─────────────────────────────────────────────────────────────
define('TOKEN_EXPIRY_HOURS', 24);
