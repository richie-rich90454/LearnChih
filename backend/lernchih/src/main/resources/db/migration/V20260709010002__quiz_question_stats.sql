-- ============================================================
-- LernChih - Quiz Question Statistics (F17)
-- Flyway Migration V20260709010002
-- ============================================================
-- Per-question aggregate statistics used to compute difficulty and
-- discrimination. Each quiz submission increments `times_attempted`
-- for every answered question; `times_correct` and the score sums
-- feed two metrics:
--   difficulty     = times_correct / times_attempted   (lower = harder)
--   discrimination = avg(score | correct) - avg(score | wrong)
--                    (higher = better at separating strong from weak)
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_question_stats (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id       BIGINT NOT NULL UNIQUE,
    times_attempted   INT    NOT NULL DEFAULT 0,
    times_correct     INT    NOT NULL DEFAULT 0,
    sum_score_correct INT    NOT NULL DEFAULT 0,
    sum_score_wrong   INT    NOT NULL DEFAULT 0,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_question_stats_question FOREIGN KEY (question_id)
        REFERENCES quiz_questions (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
