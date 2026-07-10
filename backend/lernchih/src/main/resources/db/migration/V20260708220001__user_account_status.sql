-- ============================================================
-- LernChih - Admin user management: account status column
-- Flyway Migration V20260708220001 (F87)
-- ============================================================
-- Adds an account-status column to users so administrators can suspend or
-- ban accounts. Existing rows default to ACTIVE so current users keep access.
-- Distinct from the existing profile_status (free-text status message).

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
