-- ============================================================
-- LernChih - Notes with wikilinks (F9)
-- Flyway Migration V20260708200002
--
-- Stores user-authored notes. Content is TEXT so it can hold long
-- markdown bodies including [[wikilink]] references. The optional
-- subject_id groups a note under a subject. updated_at is refreshed
-- on every edit so the note list can be ordered by recent activity.
-- ============================================================

CREATE TABLE IF NOT EXISTS notes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    subject_id  BIGINT       NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
    CONSTRAINT fk_notes_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_notes_user_id    ON notes (user_id);
CREATE INDEX idx_notes_user_title ON notes (user_id, title);
