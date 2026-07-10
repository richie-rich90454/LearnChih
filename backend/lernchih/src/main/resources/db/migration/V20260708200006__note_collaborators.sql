-- ============================================================
-- LernChih - Note collaborators (F14)
-- Flyway Migration V20260708200006
--
-- Tracks who may collaborate on a note. The note owner is seeded as
-- a collaborator with role OWNER when they first open the collaborative
-- editor; invited peers are EDITOR (can write) or VIEWER (read-only).
-- The collaborator list powers the real-time presence panel.
-- ============================================================

CREATE TABLE IF NOT EXISTS note_collaborators (
    id        BIGINT       AUTO_INCREMENT PRIMARY KEY,
    note_id   BIGINT       NOT NULL,
    user_id   BIGINT       NOT NULL,
    role      VARCHAR(32)  NOT NULL,
    added_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_note_collaborators_note FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    CONSTRAINT fk_note_collaborators_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uk_note_collaborators_note_user (note_id, user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_note_collaborators_note ON note_collaborators (note_id);
CREATE INDEX idx_note_collaborators_user ON note_collaborators (user_id);
