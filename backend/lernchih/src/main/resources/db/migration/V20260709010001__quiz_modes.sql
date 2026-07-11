-- ============================================================
-- LernChih - Quiz Modes (F16)
-- Flyway Migration V20260709010001
-- ============================================================
-- Adds a `mode` column to `quizzes` so a quiz can be taken in one
-- of three modes: TIMED (countdown), MASTERY (re-queue wrong answers
-- until all correct, capped at a few rounds), or ADAPTIVE (re-queue
-- wrong once, early-finish once enough answers are correct). A
-- nullable `time_limit_seconds` backs the TIMED countdown.
-- ============================================================

ALTER TABLE quizzes ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'TIMED';
ALTER TABLE quizzes ADD COLUMN time_limit_seconds INT NULL;
