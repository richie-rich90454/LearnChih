-- ============================================================
-- LernChih - API Key Scopes (F94)
-- Flyway Migration V20260709040001
-- Adds scoped permissions (read, write, admin) to API keys and
-- records when a key was revoked.
-- ============================================================

ALTER TABLE api_keys
    ADD COLUMN scopes      VARCHAR(255) NULL,
    ADD COLUMN revoked_at  DATETIME     NULL;

-- Backfill scopes for legacy keys so they keep full read access.
UPDATE api_keys SET scopes = 'read' WHERE scopes IS NULL;