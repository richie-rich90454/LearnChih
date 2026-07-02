-- ============================================================
-- LernChih Forum - Polls, Drafts, Tags, Content Versioning
-- Flyway Migration V5
-- ============================================================
-- Posts are polymorphic (resource_posts vs channel_posts), so post
-- references use (post_id, post_type).

-- 1. polls
CREATE TABLE IF NOT EXISTS polls (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    post_type  VARCHAR(20) NOT NULL,
    question   VARCHAR(500) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_polls_post ON polls (post_id, post_type);

-- 2. poll_options
CREATE TABLE IF NOT EXISTS poll_options (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    poll_id      BIGINT       NOT NULL,
    option_text  VARCHAR(255) NOT NULL,
    vote_count   INT          NOT NULL DEFAULT 0,
    CONSTRAINT fk_poll_options_poll FOREIGN KEY (poll_id) REFERENCES polls (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_poll_options_poll_id ON poll_options (poll_id);

-- 3. poll_votes
-- A user may vote once per poll (unique on user_id + poll_id).
CREATE TABLE IF NOT EXISTS poll_votes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    poll_id    BIGINT NOT NULL,
    option_id  BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    voted_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, poll_id),
    CONSTRAINT fk_poll_votes_poll   FOREIGN KEY (poll_id)   REFERENCES polls (id) ON DELETE CASCADE,
    CONSTRAINT fk_poll_votes_option FOREIGN KEY (option_id) REFERENCES poll_options (id) ON DELETE CASCADE,
    CONSTRAINT fk_poll_votes_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_poll_votes_poll_id  ON poll_votes (poll_id);
CREATE INDEX idx_poll_votes_option_id ON poll_votes (option_id);

-- 4. drafts
-- post_id is nullable: a draft may be a standalone composition not yet
-- associated with any post.
CREATE TABLE IF NOT EXISTS drafts (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    post_id     BIGINT,
    post_type   VARCHAR(20),
    title       VARCHAR(255),
    content     TEXT,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drafts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_drafts_user_id ON drafts (user_id);

-- 5. tags
CREATE TABLE IF NOT EXISTS tags (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE (name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. post_tags
-- Polymorphic join between tags and posts.
CREATE TABLE IF NOT EXISTS post_tags (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    post_type  VARCHAR(20) NOT NULL,
    tag_id     BIGINT      NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, post_type, tag_id),
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_post_tags_post ON post_tags (post_id, post_type);
CREATE INDEX idx_post_tags_tag  ON post_tags (tag_id);

-- 7. content_versions
-- Snapshots of rich content for version history / rollback.
CREATE TABLE IF NOT EXISTS content_versions (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id          BIGINT      NOT NULL,
    post_type        VARCHAR(20) NOT NULL,
    version_number   INT         NOT NULL,
    content_markdown TEXT,
    content_html     TEXT,
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       BIGINT      NOT NULL,
    CONSTRAINT fk_content_versions_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_content_versions_post ON content_versions (post_id, post_type);
