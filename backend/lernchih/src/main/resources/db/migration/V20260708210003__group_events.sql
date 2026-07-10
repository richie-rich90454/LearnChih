-- F41: Group events / meetups for study groups
CREATE TABLE IF NOT EXISTS group_events (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id     BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NULL,
    start_time   DATETIME     NOT NULL,
    end_time     DATETIME     NULL,
    location     VARCHAR(255) NULL,
    meeting_url  VARCHAR(500) NULL,
    created_by   BIGINT       NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_events_group   FOREIGN KEY (group_id)   REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_events_creator FOREIGN KEY (created_by) REFERENCES users (id)        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_group_events_group      ON group_events (group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_start_time ON group_events (start_time);

CREATE TABLE IF NOT EXISTS event_rsvps (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id     BIGINT       NOT NULL,
    user_id      BIGINT       NOT NULL,
    status       VARCHAR(16)  NOT NULL DEFAULT 'GOING',
    responded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_event_rsvps_pair UNIQUE (event_id, user_id),
    CONSTRAINT fk_event_rsvps_event FOREIGN KEY (event_id) REFERENCES group_events (id) ON DELETE CASCADE,
    CONSTRAINT fk_event_rsvps_user  FOREIGN KEY (user_id)  REFERENCES users (id)         ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user  ON event_rsvps (user_id);
