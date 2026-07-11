-- ============================================================
-- LernChih - Screen sharing in study sessions (F44)
-- Flyway Migration V20260709030001
--
-- Tracks screen-share sessions attached to a study group. The
-- backend owns the lifecycle (start / list / end); real-time
-- video capture is handled client-side via getDisplayMedia.
-- ============================================================

CREATE TABLE IF NOT EXISTS screen_share_sessions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_group_id  BIGINT       NOT NULL,
    sharer_user_id  BIGINT       NOT NULL,
    started_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME     NULL,
    CONSTRAINT fk_screen_shares_group FOREIGN KEY (study_group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_screen_shares_user  FOREIGN KEY (sharer_user_id) REFERENCES users (id)        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_screen_shares_group ON screen_share_sessions (study_group_id);
CREATE INDEX idx_screen_shares_active ON screen_share_sessions (study_group_id, ended_at);
