-- ============================================================
-- LernChih - Featured-badge showcase (F37)
-- Flyway Migration V20260708110007
-- ============================================================

ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_badges_featured
    ON user_badges (user_id, featured);
