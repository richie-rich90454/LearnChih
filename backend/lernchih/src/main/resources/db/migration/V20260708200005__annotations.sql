-- ============================================================
-- LernChih - Inline resource annotations (F13)
-- Flyway Migration V20260708200005
--
-- Stores inline annotations anchored to a quote from a resource.
-- The quote field holds the text being annotated; content holds the
-- user's comment. Optional start_offset/end_offset capture a character
-- range for future text-selection integration.
-- ============================================================

CREATE TABLE IF NOT EXISTS annotations (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    resource_id  BIGINT       NOT NULL,
    quote        TEXT         NOT NULL,
    content      TEXT         NOT NULL,
    start_offset INT          NULL,
    end_offset   INT          NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_annotations_user     FOREIGN KEY (user_id)     REFERENCES users (id)     ON DELETE CASCADE,
    CONSTRAINT fk_annotations_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_annotations_user_resource ON annotations (user_id, resource_id);
