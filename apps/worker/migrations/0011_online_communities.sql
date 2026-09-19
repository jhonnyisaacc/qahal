-- Keep FK constraints valid throughout the parent-table rebuild. D1 runs this migration atomically.
CREATE TABLE migration_people AS SELECT * FROM community_people;
CREATE TABLE migration_badges AS SELECT * FROM community_person_badges;
CREATE TABLE migration_memberships AS SELECT * FROM user_community_memberships;
CREATE TABLE migration_slots AS SELECT * FROM community_meeting_slots;
DELETE FROM community_person_badges;
DELETE FROM community_people;
DELETE FROM user_community_memberships;
DELETE FROM community_meeting_slots;
CREATE TABLE communities_new (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, country TEXT,
  latitude REAL, longitude REAL,
  default_member_state TEXT NOT NULL DEFAULT 'not_member' CHECK(default_member_state IN ('not_member','requested','member')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_telegram_id INTEGER,
  type TEXT NOT NULL DEFAULT 'in_person' CHECK(type IN ('in_person','online')),
  CHECK(type = 'online' OR (city IS NOT NULL AND country IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL)),
  CHECK(type = 'in_person' OR (latitude IS NULL AND longitude IS NULL))
);
INSERT INTO communities_new SELECT id,name,city,country,latitude,longitude,default_member_state,created_at,updated_at,owner_telegram_id,type FROM communities;
DROP TABLE communities;
ALTER TABLE communities_new RENAME TO communities;
CREATE INDEX communities_type ON communities(type);

INSERT INTO community_people SELECT * FROM migration_people;
INSERT INTO community_person_badges SELECT * FROM migration_badges;
INSERT INTO user_community_memberships SELECT * FROM migration_memberships;
INSERT INTO community_meeting_slots SELECT * FROM migration_slots;
DROP TABLE migration_people;
DROP TABLE migration_badges;
DROP TABLE migration_memberships;
DROP TABLE migration_slots;
CREATE INDEX communities_area ON communities(type, latitude);
CREATE INDEX communities_owner ON communities(owner_telegram_id);
