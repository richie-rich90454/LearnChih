-- ============================================================
-- LernChih - Per-thread subscription digest frequency (F33)
-- Flyway Migration V20260708110003
-- ============================================================

-- Default digest frequency advertised on a resource thread.
ALTER TABLE resource_threads ADD COLUMN IF NOT EXISTS digest_frequency VARCHAR(20);

CREATE TABLE IF NOT EXISTS thread_subscriptions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    thread_id     BIGINT NOT NULL,
    frequency     VARCHAR(20) NOT NULL DEFAULT 'NONE',
    last_digest_at DATETIME,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, thread_id),
    CONSTRAINT fk_thread_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_thread_subscriptions_user ON thread_subscriptions (user_id);
CREATE INDEX idx_thread_subscriptions_thread ON thread_subscriptions (thread_id);
