-- F92: Create the system_settings table for platform-wide key/value
-- settings. The maintenance banner is the first consumer: its key is
-- "maintenance_banner" and its value is a JSON string.

CREATE TABLE IF NOT EXISTS system_settings (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings (setting_key);

-- Seed the default maintenance banner setting (disabled by default).
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('maintenance_banner', '{"enabled":false,"message":"","level":"info"}')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
