-- ── Fresh install ─────────────────────────────────────────────────────────────

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

-- ── Migrations (safe to run on existing tables) ────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS room_number TINYINT DEFAULT NULL
    COMMENT '1-3 for 3-bed rooms, NULL for whole property';
