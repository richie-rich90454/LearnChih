-- ============================================================
-- LernChih - Study-group voice rooms (F43)
-- Flyway Migration V20260708210005
--
-- Lightweight room lifecycle table. Audio transport is client-side
-- (getUserMedia); this table only tracks whether a room exists and is
-- currently live (active) so group members can discover and join it.
-- ============================================================

CREATE TABLE IF NOT EXISTS voice_rooms (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_group_id  BIGINT       NOT NULL,
    name            VARCHAR(255) NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      BIGINT       NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voice_rooms_group FOREIGN KEY (study_group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_voice_rooms_user  FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_voice_rooms_group ON voice_rooms (study_group_id);
CREATE INDEX idx_voice_rooms_active ON voice_rooms (study_group_id, active);
