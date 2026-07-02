-- ============================================================
-- LernChih Forum - Flashcards, Quizzes, Study Groups, Collections, Annotations
-- Flyway Migration V11 (Tasks 8.14, 8.15)
-- ============================================================

-- 1. flashcard_decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flashcard_decks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_flashcard_decks_user_id ON flashcard_decks (user_id);

-- 2. flashcards (SM-2 spaced repetition fields)
CREATE TABLE IF NOT EXISTS flashcards (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    deck_id       BIGINT NOT NULL,
    front         TEXT   NOT NULL,
    back          TEXT   NOT NULL,
    ease_factor   FLOAT  NOT NULL DEFAULT 2.5,
    interval_days INT    NOT NULL DEFAULT 1,
    repetitions   INT    NOT NULL DEFAULT 0,
    next_review   DATE,
    CONSTRAINT fk_flashcards_deck FOREIGN KEY (deck_id) REFERENCES flashcard_decks (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_flashcards_deck_id     ON flashcards (deck_id);
CREATE INDEX idx_flashcards_next_review ON flashcards (next_review);

-- 3. quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id       BIGINT NOT NULL,
    question      TEXT   NOT NULL,
    options_json  TEXT   NOT NULL,
    answer_index  INT    NOT NULL,
    explanation   TEXT,
    CONSTRAINT fk_quiz_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);

-- 5. quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id   BIGINT NOT NULL,
    user_id   BIGINT NOT NULL,
    score     INT    NOT NULL,
    total     INT    NOT NULL,
    taken_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);

-- 6. study_groups
CREATE TABLE IF NOT EXISTS study_groups (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id  BIGINT       NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_groups_creator FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_study_groups_creator_id ON study_groups (creator_id);

-- 7. study_group_members
CREATE TABLE IF NOT EXISTS study_group_members (
    group_id BIGINT      NOT NULL,
    user_id  BIGINT      NOT NULL,
    role     VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_sgm_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_sgm_user  FOREIGN KEY (user_id)  REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. collections
CREATE TABLE IF NOT EXISTS collections (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_collections_user_id ON collections (user_id);

-- 9. collection_items
CREATE TABLE IF NOT EXISTS collection_items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    collection_id BIGINT   NOT NULL,
    resource_id   BIGINT   NOT NULL,
    added_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collection_id, resource_id),
    CONSTRAINT fk_collection_items_collection FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_items_resource   FOREIGN KEY (resource_id)   REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_collection_items_collection_id ON collection_items (collection_id);

-- 10. annotations
CREATE TABLE IF NOT EXISTS annotations (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT   NOT NULL,
    resource_id   BIGINT   NOT NULL,
    content       TEXT     NOT NULL,
    position_json TEXT,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_annotations_user     FOREIGN KEY (user_id)    REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_annotations_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_annotations_resource_id ON annotations (resource_id);
