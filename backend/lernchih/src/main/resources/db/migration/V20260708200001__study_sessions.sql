-- ============================================================
-- LernChih - Pomodoro study session logging (F7)
-- Flyway Migration V20260708200001
--
-- Records completed Pomodoro focus / break blocks per user. The
-- optional resource_id links a focus block to the studied resource.
-- ============================================================

CREATE TABLE IF NOT EXISTS study_sessions (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT      NOT NULL,
    start_time        DATETIME    NOT NULL,
    end_time          DATETIME    NOT NULL,
    duration_minutes  INT         NOT NULL,
    type              VARCHAR(16) NOT NULL,
    resource_id       BIGINT      NULL,
    created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_study_sessions_user_id ON study_sessions (user_id);
CREATE INDEX idx_study_sessions_user_start ON study_sessions (user_id, start_time);
