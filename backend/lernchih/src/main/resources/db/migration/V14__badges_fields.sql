-- ============================================================
-- LernChih Forum - Badge Expansion Fields
-- Flyway Migration V14 (Task 8.13)
-- ============================================================
-- Adds required-credit thresholds and timestamps to the existing
-- badges tables created in V10, plus seeds default badges.

ALTER TABLE badges ADD COLUMN required_credits INT NOT NULL DEFAULT 0;
ALTER TABLE badges ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE user_badges ADD COLUMN earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_badges_required_credits ON badges (required_credits);
CREATE INDEX idx_user_badges_earned_at ON user_badges (earned_at);

INSERT IGNORE INTO badges (name, description, icon, required_credits) VALUES
('Newcomer', 'Joined the community', '🌱', 0),
('Contributor', 'Shared first resource', '📤', 50),
('Top Contributor', 'Earned 500 credits', '🏆', 500);
