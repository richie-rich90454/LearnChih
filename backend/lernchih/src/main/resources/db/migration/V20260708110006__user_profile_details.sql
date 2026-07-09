-- ============================================================
-- LernChih - Profile status, pronouns, and timezone (F36)
-- Flyway Migration V20260708110006
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS pronouns VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(60);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_status VARCHAR(120);
