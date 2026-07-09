-- ============================================================
-- LernChih - Study Group Chat Messages (F32)
-- Flyway Migration V20260708110002
-- ============================================================

CREATE TABLE IF NOT EXISTS group_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_group_id  BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    content         TEXT   NOT NULL,
    sent_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_messages_group FOREIGN KEY (study_group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_messages_user  FOREIGN KEY (user_id)         REFERENCES users (id)        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_group_messages_group ON group_messages (study_group_id);
