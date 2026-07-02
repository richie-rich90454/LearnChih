-- ============================================================
-- LernChih Forum - Gamification Expansion
-- Flyway Migration V10 (Task 8.13)
-- ============================================================

-- 1. badges
CREATE TABLE IF NOT EXISTS badges (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(500),
    icon          VARCHAR(255),
    criteria_json TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX idx_badges_name ON badges (name);

-- 2. user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    badge_id   BIGINT   NOT NULL,
    awarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, badge_id),
    CONSTRAINT fk_user_badges_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_user_badges_user_id ON user_badges (user_id);

-- 3. streaks
CREATE TABLE IF NOT EXISTS streaks (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT NOT NULL,
    current_streak     INT    NOT NULL DEFAULT 0,
    longest_streak     INT    NOT NULL DEFAULT 0,
    last_activity_date DATE,
    UNIQUE (user_id),
    CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. daily_challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward   INT      NOT NULL DEFAULT 0,
    expires_at  DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. seasons
CREATE TABLE IF NOT EXISTS seasons (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    start_date DATETIME,
    end_date   DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. user_progress
CREATE TABLE IF NOT EXISTS user_progress (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id   BIGINT NOT NULL,
    season_id BIGINT,
    xp        INT    NOT NULL DEFAULT 0,
    level     INT    NOT NULL DEFAULT 1,
    UNIQUE (user_id, season_id),
    CONSTRAINT fk_user_progress_user   FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_progress_season FOREIGN KEY (season_id) REFERENCES seasons (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_user_progress_user_id ON user_progress (user_id);
