CREATE TABLE access_codes (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  leader_telegram_id INTEGER NOT NULL REFERENCES users(telegram_id),
  expires_at INTEGER NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 100 CHECK(max_uses > 0),
  revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admissions (
  telegram_id INTEGER PRIMARY KEY,
  code_id TEXT NOT NULL REFERENCES access_codes(id),
  admitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX admissions_code_id ON admissions(code_id);
CREATE TABLE access_attempts (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
