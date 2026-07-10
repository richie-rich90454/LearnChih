-- ============================================================
-- LernChih - Note templates (F11)
-- Flyway Migration V20260708200003
--
-- Stores reusable note templates. System templates have a NULL
-- user_id and are available to every user; user templates are
-- scoped to their owner. The content field holds the template
-- body which may include [[wikilink]] placeholders.
-- ============================================================

CREATE TABLE IF NOT EXISTS note_templates (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NULL,
    name        VARCHAR(255) NOT NULL,
    content     TEXT,
    category    VARCHAR(255) NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_note_templates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_note_templates_user_id ON note_templates (user_id);

-- Seed a few system templates (user_id is NULL) so the gallery is
-- populated on first launch.
INSERT INTO note_templates (user_id, name, content, category) VALUES
(NULL, 'Cornell Notes',
 '## Cue\n- Key question or term\n\n## Notes\n- Main points from the lecture or reading\n\n## Summary\n- One-paragraph synthesis',
 'study'),
(NULL, 'Meeting Notes',
 '## Agenda\n1. \n2. \n3. \n\n## Decisions\n- \n\n## Action Items\n- [ ] \n- [ ] ',
 'meeting'),
(NULL, 'Daily Journal',
 '## {{date}}\n\n### Wins\n- \n\n### Learnings\n- \n\n### Tomorrow\n- ',
 'journal'),
(NULL, 'Concept Map',
 '# [[Central Concept]]\n\n## Related\n- [[Subtopic 1]]\n- [[Subtopic 2]]\n\n## Questions\n- ',
 'study');
