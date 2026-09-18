-- Admin auth, operational booking fields, inquiry workflow, audit

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  password_changed_at TEXT
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS admin_audit (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit (created_at DESC);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  ip TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip, created_at);

ALTER TABLE bookings ADD COLUMN staff_notes TEXT;
ALTER TABLE bookings ADD COLUMN source TEXT NOT NULL DEFAULT 'web';
ALTER TABLE bookings ADD COLUMN updated_at TEXT;
ALTER TABLE bookings ADD COLUMN cancelled_at TEXT;

ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE inquiries ADD COLUMN staff_notes TEXT;
ALTER TABLE inquiries ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings (status, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status, created_at);
