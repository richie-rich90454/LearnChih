-- ============================================================
-- LernChih - Direct Messages (F31)
-- Flyway Migration V20260708110001
-- ============================================================

CREATE TABLE IF NOT EXISTS direct_messages (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT NOT NULL,
    to_user_id   BIGINT NOT NULL,
    content      TEXT   NOT NULL,
    sent_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at      DATETIME,
    CONSTRAINT fk_dm_from_user FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dm_to_user   FOREIGN KEY (to_user_id)   REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_dm_from_user ON direct_messages (from_user_id);
CREATE INDEX idx_dm_to_user   ON direct_messages (to_user_id);
