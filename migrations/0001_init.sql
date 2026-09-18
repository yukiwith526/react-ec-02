-- 杣音 booking schema

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  confirmation_code TEXT NOT NULL UNIQUE,
  villa_id TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  guests INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_kana TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  meal_plan TEXT NOT NULL,
  notes TEXT,
  lodging INTEGER NOT NULL,
  meals INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_villa_dates ON bookings (villa_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings (confirmation_code);

CREATE TABLE IF NOT EXISTS blocked_dates (
  villa_id TEXT NOT NULL,
  date TEXT NOT NULL,
  reason TEXT,
  PRIMARY KEY (villa_id, date)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO blocked_dates (villa_id, date, reason) VALUES
  ('rokumei', '2026-12-31', '年末休業'),
  ('rokumei', '2027-01-01', '年始休業'),
  ('yukihotaru', '2026-12-31', '年末休業'),
  ('yukihotaru', '2027-01-01', '年始休業');

INSERT INTO bookings (
  id, confirmation_code, villa_id, check_in, check_out, guests,
  guest_name, guest_kana, email, phone, meal_plan, notes,
  lodging, meals, tax, total, status
) VALUES
  (
    'seed-rokumei-oct',
    'SOMA-7K2M9Q',
    'rokumei',
    '2026-10-10',
    '2026-10-12',
    4,
    '山田 太郎',
    'ヤマダ タロウ',
    'yamada@example.com',
    '090-0000-0000',
    'both',
    NULL,
    256000,
    176000,
    1600,
    433600,
    'confirmed'
  ),
  (
    'seed-yuki-nov',
    'SOMA-3H8R1C',
    'yukihotaru',
    '2026-11-20',
    '2026-11-23',
    2,
    '佐藤 花子',
    'サトウ ハナコ',
    'sato@example.com',
    '080-0000-0000',
    'dinner',
    NULL,
    274000,
    108000,
    1200,
    383200,
    'confirmed'
  );
