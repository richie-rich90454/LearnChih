-- ============================================================
-- LernChih - Study-buddy matching (F39)
-- Flyway Migration V20260708210001
-- ============================================================

CREATE TABLE IF NOT EXISTS study_buddy_matches (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    buddy_id    BIGINT      NOT NULL,
    match_score INT          NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'SUGGESTED',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_study_buddy_matches_pair UNIQUE (user_id, buddy_id),
    CONSTRAINT fk_study_buddy_matches_user  FOREIGN KEY (user_id)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_buddy_matches_buddy FOREIGN KEY (buddy_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_study_buddy_matches_user_status
    ON study_buddy_matches (user_id, status);
