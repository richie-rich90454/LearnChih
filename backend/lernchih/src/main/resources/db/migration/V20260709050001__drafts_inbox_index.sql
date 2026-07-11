-- ============================================================
-- LernChih - Drafts inbox composite index (F64)
-- Flyway Migration V20260709050001
--
-- The unified drafts inbox lists a user's drafts ordered by
-- most-recently-updated. The existing single-column index on
-- user_id forces a filesort for that ORDER BY; this composite
-- index covers both columns so the inbox query is index-only.
-- ============================================================

CREATE INDEX idx_drafts_user_updated ON drafts (user_id, updated_at);
