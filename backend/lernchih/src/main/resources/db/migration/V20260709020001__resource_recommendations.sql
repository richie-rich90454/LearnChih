-- ============================================================
-- LernChih - Content-based resource recommendations (F23)
-- Flyway Migration V20260709020001
-- ============================================================
-- Tracks lightweight user interactions with resources (views,
-- upvotes) so the RecommendationService can build a content-based
-- profile (subject + category affinity) and surface similar
-- resources the user has not yet seen.

CREATE TABLE IF NOT EXISTS resource_interactions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    resource_id     BIGINT       NOT NULL,
    interaction     VARCHAR(20)  NOT NULL,
    subject_id      BIGINT,
    category        VARCHAR(40),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_interactions_user     FOREIGN KEY (user_id)     REFERENCES users (id)     ON DELETE CASCADE,
    CONSTRAINT fk_resource_interactions_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_resource_interactions_user_id     ON resource_interactions (user_id);
CREATE INDEX idx_resource_interactions_resource_id ON resource_interactions (resource_id);
