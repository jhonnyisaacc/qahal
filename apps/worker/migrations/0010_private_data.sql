CREATE TABLE private_data (
  context TEXT PRIMARY KEY,
  ciphertext TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN username_index TEXT;
CREATE INDEX users_username_index ON users(username_index);
ALTER TABLE users ADD COLUMN discoverable INTEGER NOT NULL DEFAULT 0 CHECK(discoverable IN (0,1));
ALTER TABLE users ADD COLUMN contact_visible INTEGER NOT NULL DEFAULT 0 CHECK(contact_visible IN (0,1));
DELETE FROM user_locations WHERE id NOT IN (SELECT MAX(id) FROM user_locations GROUP BY telegram_id);
UPDATE user_locations SET latitude = ROUND(latitude * 20) / 20.0, longitude = ROUND(longitude * 20) / 20.0, accuracy = NULL;
CREATE UNIQUE INDEX user_current_location ON user_locations(telegram_id);
UPDATE users SET photo_url = NULL;
CREATE TRIGGER no_user_photos_insert BEFORE INSERT ON users WHEN NEW.photo_url IS NOT NULL BEGIN SELECT RAISE(ABORT, 'pictures_disabled'); END;
CREATE TRIGGER no_user_photos_update BEFORE UPDATE OF photo_url ON users WHEN NEW.photo_url IS NOT NULL BEGIN SELECT RAISE(ABORT, 'pictures_disabled'); END;
ALTER TABLE communities ADD COLUMN type TEXT NOT NULL DEFAULT 'in_person' CHECK(type IN ('in_person', 'online'));
UPDATE communities SET latitude = ROUND(latitude * 20) / 20.0, longitude = ROUND(longitude * 20) / 20.0;
CREATE INDEX communities_type ON communities(type);

CREATE INDEX user_locations_area ON user_locations(latitude);
