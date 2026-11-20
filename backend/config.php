<?php

// ── Database ──────────────────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'firstros_firstrose_db');
define('DB_USER', 'firstros_alescas_firstrose');
define('DB_PASS', 'L:.TwYhM6t32i2');

// ── Email ─────────────────────────────────────────────────────────────────────
define('ADMIN_EMAIL', 'peterkalu41@gmail.com');
define('FROM_EMAIL',  'bookings@firstrosevilla.com');
define('SITE_NAME',   'Firstrose Villa');

// ── CORS ──────────────────────────────────────────────────────────────────────
// Set to your frontend origin (no trailing slash)
define('CORS_ORIGIN', getenv('FRONTEND_URL') ?: 'https://firstrose.co.ke');

// ── Admin session ─────────────────────────────────────────────────────────────
define('TOKEN_EXPIRY_HOURS', 24);
