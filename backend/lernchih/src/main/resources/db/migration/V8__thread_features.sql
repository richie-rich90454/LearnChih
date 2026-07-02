-- ============================================================
-- LernChih Forum - Nested Comments & Thread Features
-- Flyway Migration V8
-- ============================================================
-- Part 1 (Task 8.8): nested comment threading via a self-referential
--   `comments` table. parent_id points at another comment to form a tree.
-- Part 2 (Task 8.9): per-thread pin/lock/Q&A flags stored in
--   `thread_features`, and resource `reviews`.

-- 1. comments
-- Posts are polymorphic (resource_posts vs channel_posts), so references
-- use (post_id, post_type).
CREATE TABLE IF NOT EXISTS comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    post_type  VARCHAR(20) NOT NULL,
    parent_id  BIGINT,
    user_id    BIGINT      NOT NULL,
    content    TEXT        NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user   FOREIGN KEY (user_id)    REFERENCES users   (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_comments_post   ON comments (post_id, post_type);
CREATE INDEX idx_comments_parent ON comments (parent_id);
CREATE INDEX idx_comments_user   ON comments (user_id);

-- 2. thread_features
-- Threads are polymorphic (resource_threads vs channel_threads), so
-- references use (thread_id, thread_type). One feature row per thread.
CREATE TABLE IF NOT EXISTS thread_features (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_type        VARCHAR(20) NOT NULL,
    thread_id          BIGINT      NOT NULL,
    is_pinned          BOOLEAN     NOT NULL DEFAULT FALSE,
    is_locked          BOOLEAN     NOT NULL DEFAULT FALSE,
    is_qa              BOOLEAN     NOT NULL DEFAULT FALSE,
    accepted_answer_id BIGINT,
    updated_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (thread_type, thread_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_thread_features_thread ON thread_features (thread_type, thread_id);

-- 3. reviews
-- A user may review a resource once (unique on resource_id + user_id).
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    rating      INT    NOT NULL,
    review_text TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resource_id, user_id),
    CONSTRAINT fk_reviews_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_reviews_resource_id ON reviews (resource_id);
