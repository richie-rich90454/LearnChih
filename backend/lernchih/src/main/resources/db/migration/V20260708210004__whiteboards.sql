CREATE TABLE IF NOT EXISTS whiteboards (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id     BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    content      LONGTEXT     NULL,
    created_by   BIGINT       NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_whiteboards_group   FOREIGN KEY (group_id)   REFERENCES study_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_whiteboards_creator FOREIGN KEY (created_by) REFERENCES users (id)        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX IF NOT EXISTS idx_whiteboards_group ON whiteboards (group_id);
