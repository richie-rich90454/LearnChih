-- ============================================================
-- LernChih Forum - TOTP 2FA Fields
-- Flyway Migration V22 (Task 8.16)
-- ============================================================

ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT FALSE;
