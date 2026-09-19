ALTER TABLE users ADD COLUMN emunah_state TEXT CHECK (emunah_state IN ('leader', 'experienced', 'starting'));

ALTER TABLE users ADD COLUMN emunah_level_approved INTEGER NOT NULL DEFAULT 1 CHECK (emunah_level_approved IN (0, 1));

CREATE INDEX IF NOT EXISTS idx_users_emunah_state_approval ON users(emunah_state, emunah_level_approved);