-- ============================================================
-- LernChih Forum - Study Groups
-- Flyway Migration V15 (Task 8.15)
-- ============================================================

CREATE TABLE IF NOT EXISTS study_groups (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    owner_user_id BIGINT NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_groups_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_study_groups_owner ON study_groups (owner_user_id);

CREATE TABLE IF NOT EXISTS study_group_members (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id  BIGINT NOT NULL,
    user_id   BIGINT NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id),
    CONSTRAINT fk_study_group_members_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_group_members_user  FOREIGN KEY (user_id)  REFERENCES users        (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_study_group_members_group ON study_group_members (group_id);
CREATE INDEX idx_study_group_members_user  ON study_group_members (user_id);
