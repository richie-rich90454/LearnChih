-- F91: Create the feature_flags table for platform feature toggles.
-- Each row represents a single flag: a unique key, a human-readable
-- description, an enabled boolean, and audit timestamps.

CREATE TABLE IF NOT EXISTS feature_flags (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    flag_key    VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags (flag_key);

-- Seed a few default flags so the admin page is not empty on first load.
INSERT INTO feature_flags (flag_key, description, enabled) VALUES
    ('enable_quiz_engine', 'Enable the interactive quiz engine for all users', FALSE),
    ('enable_study_buddy', 'Enable the AI study buddy matching feature', FALSE),
    ('enable_cohorts', 'Enable cohort-based learning groups', FALSE)
ON DUPLICATE KEY UPDATE flag_key = flag_key;
