-- ============================================================
-- LernChih - Study playlists (F2)
-- Flyway Migration V20260708100002
--
-- User-curated, ordered lists of resources for sequential study.
-- ============================================================

CREATE TABLE IF NOT EXISTS playlists (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_playlists_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_playlists_user_id ON playlists (user_id);

CREATE TABLE IF NOT EXISTS playlist_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    playlist_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    sort_order  INT    NOT NULL DEFAULT 0,
    added_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (playlist_id, resource_id),
    CONSTRAINT fk_playlist_items_playlist FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
    CONSTRAINT fk_playlist_items_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_playlist_items_playlist_id ON playlist_items (playlist_id);
CREATE INDEX idx_playlist_items_sort_order ON playlist_items (playlist_id, sort_order);
