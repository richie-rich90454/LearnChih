-- ============================================================
-- LernChih Forum - Per-subject concept map (F6)
-- Flyway Migration V20260708100004
-- ============================================================

-- 1. concept_map_nodes
CREATE TABLE IF NOT EXISTS concept_map_nodes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT       NOT NULL,
    label      VARCHAR(255) NOT NULL,
    pos_x      DOUBLE       NOT NULL DEFAULT 0,
    pos_y      DOUBLE       NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cmn_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_cmn_subject_id ON concept_map_nodes (subject_id);

-- 2. concept_map_edges
CREATE TABLE IF NOT EXISTS concept_map_edges (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT   NOT NULL,
    source_id  BIGINT   NOT NULL,
    target_id  BIGINT   NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cme_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_cme_source  FOREIGN KEY (source_id)  REFERENCES concept_map_nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_cme_target  FOREIGN KEY (target_id)  REFERENCES concept_map_nodes (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_cme_subject_id ON concept_map_edges (subject_id);
