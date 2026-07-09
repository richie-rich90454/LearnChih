-- ============================================================
-- LernChih - Course module completion tracking (F3)
-- Flyway Migration V20260708100003
--
-- Defines course modules (ordered lessons within a course) and
-- per-user completion records for those modules.
-- ============================================================

CREATE TABLE IF NOT EXISTS course_modules (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id        BIGINT       NOT NULL,
    title            VARCHAR(255) NOT NULL,
    sort_order       INT          NOT NULL DEFAULT 0,
    duration_minutes INT,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_modules_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_course_modules_course_id ON course_modules (course_id);
CREATE INDEX idx_course_modules_sort_order ON course_modules (course_id, sort_order);

CREATE TABLE IF NOT EXISTS module_completions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT   NOT NULL,
    module_id     BIGINT   NOT NULL,
    completed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score         INT,
    UNIQUE (user_id, module_id),
    CONSTRAINT fk_module_completions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_module_completions_module FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_module_completions_user_id ON module_completions (user_id);
CREATE INDEX idx_module_completions_module_id ON module_completions (module_id);
