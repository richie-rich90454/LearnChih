-- ============================================================
-- LernChih - Cohort-based study groups (F40)
-- Flyway Migration V20260708210002
-- ============================================================

CREATE TABLE IF NOT EXISTS cohorts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT         NULL,
    subject_id   BIGINT       NULL,
    start_date   DATE         NULL,
    end_date     DATE         NULL,
    max_members  INT          NULL,
    created_by   BIGINT       NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cohorts_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_cohorts_created_at
    ON cohorts (created_at);

CREATE INDEX IF NOT EXISTS idx_cohorts_subject
    ON cohorts (subject_id);

CREATE TABLE IF NOT EXISTS cohort_members (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_id   BIGINT       NOT NULL,
    user_id     BIGINT       NOT NULL,
    role        VARCHAR(16)  NOT NULL DEFAULT 'MEMBER',
    joined_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cohort_members_pair UNIQUE (cohort_id, user_id),
    CONSTRAINT fk_cohort_members_cohort FOREIGN KEY (cohort_id) REFERENCES cohorts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cohort_members_user   FOREIGN KEY (user_id)   REFERENCES users (id)    ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort
    ON cohort_members (cohort_id);

CREATE INDEX IF NOT EXISTS idx_cohort_members_user
    ON cohort_members (user_id);
