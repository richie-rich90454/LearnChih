-- ============================================================
-- LernChih Forum - Public API Keys
-- Flyway Migration V17 (Task 8.20)
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    key_hash     VARCHAR(255) NOT NULL,
    name         VARCHAR(255),
    last_used_at DATETIME,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked      BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_api_keys_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (key_hash)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_api_keys_user ON api_keys (user_id);
