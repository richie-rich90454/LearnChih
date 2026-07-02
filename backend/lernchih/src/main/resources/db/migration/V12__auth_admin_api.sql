-- ============================================================
-- LernChih Forum - Auth Features, Privacy, Admin, Public API
-- Flyway Migration V12 (Tasks 8.17, 8.18, 8.19, 8.20)
-- ============================================================
-- NOTE: TOTP columns and api_keys table are created in V22 and V17 respectively.

-- 1. oauth_accounts (Task 8.16)
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    provider         VARCHAR(50)  NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts (user_id);

-- 2. password_reset_tokens (Task 8.17)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (token),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- 3. email_change_tokens (Task 8.17)
CREATE TABLE IF NOT EXISTS email_change_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    new_email  VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (token),
    CONSTRAINT fk_email_change_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. deletion_requests (Task 8.18)
CREATE TABLE IF NOT EXISTS deletion_requests (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT      NOT NULL,
    requested_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_at DATETIME    NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_deletion_requests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_deletion_requests_user_id ON deletion_requests (user_id);

-- 5. profile_customizations (Task 8.18)
CREATE TABLE IF NOT EXISTS profile_customizations (
    user_id    BIGINT PRIMARY KEY,
    bio        TEXT,
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    custom_css TEXT,
    CONSTRAINT fk_profile_customizations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. audit_logs (Task 8.19)
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id     BIGINT,
    action       VARCHAR(100) NOT NULL,
    target_type  VARCHAR(50),
    target_id    BIGINT,
    details_json TEXT,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_actor_id   ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

-- 7. mod_queue (Task 8.19)
CREATE TABLE IF NOT EXISTS mod_queue (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id   BIGINT      NOT NULL,
    reported_by  BIGINT,
    reason       TEXT        NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mod_queue_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_mod_queue_status ON mod_queue (status);

-- 8. bans (Task 8.19)
CREATE TABLE IF NOT EXISTS bans (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    banned_by  BIGINT,
    reason     TEXT     NOT NULL,
    expires_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bans_user      FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_bans_banned_by FOREIGN KEY (banned_by) REFERENCES users (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_bans_user_id ON bans (user_id);

-- 9. webhooks (Task 8.20)
CREATE TABLE IF NOT EXISTS webhooks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    url         VARCHAR(500) NOT NULL,
    events_json TEXT         NOT NULL,
    secret      VARCHAR(255),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_webhooks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_webhooks_user_id ON webhooks (user_id);

-- 10. api_keys (Task 8.20) -- see V17 for the final api_keys table with revoked flag.
