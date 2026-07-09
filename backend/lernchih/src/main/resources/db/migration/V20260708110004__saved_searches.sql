-- ============================================================
-- LernChih - Saved searches with email alerts (F34)
-- Flyway Migration V20260708110004
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_searches (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    query           VARCHAR(500) NOT NULL,
    email_alerts    BOOLEAN NOT NULL DEFAULT FALSE,
    last_notified_at DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_searches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_saved_searches_user ON saved_searches (user_id);
CREATE INDEX idx_saved_searches_alerts ON saved_searches (email_alerts);
