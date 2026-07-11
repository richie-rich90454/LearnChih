-- ============================================================
-- LernChih - Question Bank (F18)
-- Flyway Migration V20260709010003
-- ============================================================
-- A user-owned bank of reusable multiple-choice questions. Each
-- row stores the question text, options (JSON), the correct option
-- index, an explanation, and comma-separated tags for search. Bank
-- questions can be imported into any quiz, supporting reuse across
-- quizzes without re-typing.
-- ============================================================

CREATE TABLE IF NOT EXISTS question_bank (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id  BIGINT       NOT NULL,
    question       TEXT         NOT NULL,
    options_json   TEXT         NOT NULL,
    answer_index   INT          NOT NULL,
    explanation    TEXT,
    tags           VARCHAR(500) NOT NULL DEFAULT '',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_bank_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_question_bank_owner ON question_bank (owner_user_id);
CREATE INDEX idx_question_bank_tags  ON question_bank (tags);
