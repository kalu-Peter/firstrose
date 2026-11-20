<?php
/**
 * Firstrose — One-time setup script.
 * Run this in your browser once, then DELETE it.
 */

$creds_file = __DIR__ . '/admin_credentials.php';
$messages   = [];
$success    = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (strlen($username) < 3) {
        $messages[] = ['error', 'Username must be at least 3 characters.'];
    } elseif (strlen($password) < 8) {
        $messages[] = ['error', 'Password must be at least 8 characters.'];
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        file_put_contents($creds_file,
            "<?php\n" .
            "define('ADMIN_USERNAME', " . var_export($username, true) . ");\n" .
            "define('ADMIN_PASSWORD_HASH', " . var_export($hash, true) . ");\n"
        );
        $messages[] = ['ok', "Admin credentials saved."];
        $success = true;
    }

    if (!empty($_POST['create_db'])) {
        require_once __DIR__ . '/db.php';
        $db = get_db();
        foreach (array_filter(array_map('trim', explode(';', file_get_contents(__DIR__ . '/schema.sql')))) as $q) {
            $db->exec($q);
        }
        $messages[] = ['ok', 'Database tables created.'];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Firstrose — Setup</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #f9f9f9; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; padding: 40px; width: 100%; max-width: 440px; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { margin: 0 0 6px; font-size: 1.4rem; }
    .sub { color: #666; font-size: .875rem; margin-bottom: 24px; }
    .warn { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 14px; font-size: .85rem; color: #92400e; margin-bottom: 20px; }
    .msg { border-radius: 8px; padding: 10px 14px; font-size: .875rem; margin-bottom: 12px; }
    .msg.ok    { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    label { display: block; font-size: .875rem; font-weight: 500; margin-bottom: 4px; }
    input[type=text], input[type=password] { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: .9rem; margin-bottom: 16px; outline: none; }
    input[type=text]:focus, input[type=password]:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
    .check-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: .875rem; }
    button { width: 100%; padding: 11px; background: #1d4ed8; color: #fff; border: none; border-radius: 8px; font-size: .9rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #1e40af; }
    .done { text-align: center; padding: 12px 0; }
    .done strong { display: block; font-size: 1.1rem; margin-bottom: 6px; color: #065f46; }
  </style>
</head>
<body>
<div class="card">
  <h1>Firstrose — Setup</h1>
  <p class="sub">Create your admin account and initialise the database.</p>
  <div class="warn">⚠️ <strong>Delete this file</strong> from your server after setup is complete.</div>

  <?php foreach ($messages as [$type, $text]): ?>
    <div class="msg <?= $type ?>"><?= htmlspecialchars($text) ?></div>
  <?php endforeach; ?>

  <?php if ($success): ?>
    <div class="done">
      <strong>Setup complete ✓</strong>
      You can now log in at <code>/admin</code>. Delete <code>setup.php</code> now.
    </div>
  <?php else: ?>
    <form method="POST">
      <label for="u">Admin username</label>
      <input id="u" name="username" type="text" value="admin" required minlength="3">

      <label for="p">Admin password</label>
      <input id="p" name="password" type="password" required minlength="8" placeholder="Minimum 8 characters">

      <div class="check-row">
        <input type="checkbox" id="db" name="create_db" value="1" checked>
        <label for="db" style="margin:0">Create database tables</label>
      </div>

      <button type="submit">Save & Complete Setup</button>
    </form>
  <?php endif; ?>
</div>
</body>
</html>
