-- ── Fresh install ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (username, password_hash) VALUES (
  'admin',
  '$2y$10$uTtku5kL8WWhaTpJMlsTNeR7KaXCuY/Nx45rYmgWFQDctyBHT.5A.'
) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

CREATE TABLE IF NOT EXISTS bookings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  villa_id     VARCHAR(50)  NOT NULL,
  villa_name   VARCHAR(100) NOT NULL,
  guest_name   VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  phone        VARCHAR(30),
  check_in     DATE         NOT NULL,
  check_out    DATE         NOT NULL,
  guests       INT          NOT NULL DEFAULT 1,
  message      TEXT,
  room_number  TINYINT      DEFAULT NULL COMMENT '1-3 for 3-bed rooms, NULL for whole property',
  status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  deposit_paid TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      CHAR(64)  NOT NULL,
  expires_at DATETIME  NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token (token)
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  villa_id    VARCHAR(50)  NOT NULL,
  room_number TINYINT      DEFAULT NULL COMMENT 'NULL = whole villa, 1-3 = specific room',
  check_in    DATE         NOT NULL,
  check_out   DATE         NOT NULL,
  source      VARCHAR(50)  NOT NULL DEFAULT 'manual',
  note        VARCHAR(255),
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  villa_id    VARCHAR(50)   NOT NULL,
  room_number TINYINT       DEFAULT NULL COMMENT 'NULL = whole villa, 1-3 = specific room',
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  label       VARCHAR(100),
  priority    TINYINT       NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_villa_dates (villa_id, start_date, end_date)
);

-- ── Migrations (safe to run on existing tables) ────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS room_number TINYINT DEFAULT NULL
    COMMENT '1-3 for 3-bed rooms, NULL for whole property';
