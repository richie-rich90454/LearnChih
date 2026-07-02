-- ============================================================
-- LernChih Forum - Notifications, Preferences, Push, Read Receipts
-- Flyway Migration V9 (Tasks 8.10, 8.11, 8.12)
-- ============================================================

-- 1. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    data_json   TEXT,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user_id  ON notifications (user_id);
CREATE INDEX idx_notifications_unread   ON notifications (user_id, is_read);

-- 2. notification_preferences (one row per user)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT   NOT NULL,
    email_enabled  BOOLEAN  NOT NULL DEFAULT TRUE,
    push_enabled   BOOLEAN  NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN  NOT NULL DEFAULT TRUE,
    mention_email  BOOLEAN  NOT NULL DEFAULT TRUE,
    reply_email    BOOLEAN  NOT NULL DEFAULT TRUE,
    UNIQUE (user_id),
    CONSTRAINT fk_notif_prefs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. push_subscriptions (Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    endpoint    VARCHAR(500) NOT NULL,
    p256dh_key  VARCHAR(255) NOT NULL,
    auth_key    VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_push_subs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_push_subs_user_id ON push_subscriptions (user_id);

-- 4. read_receipts (no FK on post_id since posts live in multiple tables)
CREATE TABLE IF NOT EXISTS read_receipts (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id  BIGINT   NOT NULL,
    post_id  BIGINT   NOT NULL,
    read_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id),
    CONSTRAINT fk_read_receipts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_read_receipts_user_id ON read_receipts (user_id);
