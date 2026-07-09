-- ============================================================
-- LernChih - Spaced-repetition review schedule (F1)
-- Flyway Migration V20260708100001
--
-- Tracks per-user review schedules for resources, driven by the
-- SM-2 algorithm (interval, ease factor, review count, due date).
-- ============================================================

CREATE TABLE IF NOT EXISTS review_schedules (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT   NOT NULL,
    resource_id    BIGINT   NOT NULL,
    due_date       DATE     NOT NULL,
    interval_days  INT      NOT NULL DEFAULT 1,
    ease_factor    DOUBLE   NOT NULL DEFAULT 2.5,
    review_count   INT      NOT NULL DEFAULT 0,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_schedules_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_schedules_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_review_schedules_user_id ON review_schedules (user_id);
CREATE INDEX idx_review_schedules_due_date ON review_schedules (user_id, due_date);
