-- ============================================================
-- LernChih Forum - Rich Content & Attachments
-- Flyway Migration V4
-- ============================================================
-- Rich markdown/HTML bodies and file attachments for posts.
-- Posts are polymorphic (resource_posts vs channel_posts), so references
-- use (post_id, post_type) instead of a single hard foreign key.

-- 1. post_rich_content
-- Stores the markdown source and sanitized HTML rendering for a post.
-- One rich-content row per post (unique on post_id + post_type).
CREATE TABLE IF NOT EXISTS post_rich_content (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id          BIGINT       NOT NULL,
    post_type        VARCHAR(20)  NOT NULL,
    content_markdown TEXT,
    content_html     TEXT,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (post_id, post_type)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_post_rich_content_post ON post_rich_content (post_id, post_type);

-- 2. attachments
-- Metadata for files attached to a post. The file bytes live on disk under
-- app.upload.dir; only metadata is persisted here.
CREATE TABLE IF NOT EXISTS attachments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id     BIGINT       NOT NULL,
    post_type   VARCHAR(20)  NOT NULL,
    filename    VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_size   BIGINT       NOT NULL,
    mime_type   VARCHAR(100),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_attachments_post ON attachments (post_id, post_type);
