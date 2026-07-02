-- ============================================================
-- LernChih Forum - Bookmarks, Reading List, Recently Viewed
-- Flyway Migration V6
-- ============================================================

-- 1. bookmarks
-- A user may bookmark a resource once (unique on user_id + resource_id).
CREATE TABLE IF NOT EXISTS bookmarks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource_id),
    CONSTRAINT fk_bookmarks_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);

-- 2. reading_list
-- Ordered reading list. `position` preserves user-defined ordering.
CREATE TABLE IF NOT EXISTS reading_list (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    position    INT    NOT NULL DEFAULT 0,
    added_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource_id),
    CONSTRAINT fk_reading_list_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_list_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_reading_list_user_id ON reading_list (user_id);

-- 3. recently_viewed
-- Tracks each view event for analytics / "continue reading" widgets.
CREATE TABLE IF NOT EXISTS recently_viewed (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    viewed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recently_viewed_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_recently_viewed_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_recently_viewed_user_id ON recently_viewed (user_id);
