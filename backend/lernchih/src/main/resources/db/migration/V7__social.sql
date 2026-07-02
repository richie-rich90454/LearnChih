-- ============================================================
-- Lernchih Forum - Mentions, Reactions, Follows, Endorsements
-- Flyway Migration V7
-- ============================================================
-- Posts are polymorphic (resource_posts vs channel_posts), so post
-- references use (post_id, post_type).

-- 1. mentions
CREATE TABLE IF NOT EXISTS mentions (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id            BIGINT      NOT NULL,
    post_type          VARCHAR(20) NOT NULL,
    mentioned_user_id  BIGINT      NOT NULL,
    created_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mentions_mentioned_user FOREIGN KEY (mentioned_user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_mentions_post      ON mentions (post_id, post_type);
CREATE INDEX idx_mentions_user      ON mentions (mentioned_user_id);

-- 2. reactions
-- One reaction per (post, user, emoji).
CREATE TABLE IF NOT EXISTS reactions (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    post_type  VARCHAR(20) NOT NULL,
    user_id    BIGINT      NOT NULL,
    emoji      VARCHAR(20) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, post_type, user_id, emoji),
    CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_reactions_post ON reactions (post_id, post_type);

-- 3. follows
CREATE TABLE IF NOT EXISTS follows (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id  BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (follower_id, following_id),
    CONSTRAINT fk_follows_follower  FOREIGN KEY (follower_id)  REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_follows_follower  ON follows (follower_id);
CREATE INDEX idx_follows_following ON follows (following_id);

-- 4. endorsements
CREATE TABLE IF NOT EXISTS endorsements (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    endorser_id      BIGINT       NOT NULL,
    endorsed_user_id BIGINT       NOT NULL,
    skill            VARCHAR(100) NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_endorsements_endorser FOREIGN KEY (endorser_id)      REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_endorsements_endorsed FOREIGN KEY (endorsed_user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_endorsements_endorsed_user ON endorsements (endorsed_user_id);
