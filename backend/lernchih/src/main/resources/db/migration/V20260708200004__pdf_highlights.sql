-- ============================================================
-- LernChih - PDF highlights (F12)
-- Flyway Migration V20260708200004
--
-- Stores text highlights extracted from PDF resources. Each
-- highlight is scoped per user per resource so readers keep
-- their own annotation set. The color column supports a simple
-- tag system (yellow, green, blue, etc.).
-- ============================================================

CREATE TABLE IF NOT EXISTS pdf_highlights (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    resource_id      BIGINT       NOT NULL,
    page_number      INT          NOT NULL,
    highlighted_text TEXT         NOT NULL,
    color            VARCHAR(64)  NULL,
    note             TEXT         NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pdf_highlights_user     FOREIGN KEY (user_id)     REFERENCES users (id)      ON DELETE CASCADE,
    CONSTRAINT fk_pdf_highlights_resource FOREIGN KEY (resource_id) REFERENCES resources (id)  ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_pdf_highlights_user_resource ON pdf_highlights (user_id, resource_id);
