-- ============================================================
-- LernChih - API Key Rate-Limit Quotas (F95)
-- Flyway Migration V20260709040002
-- Per-key rate limits (requests per minute / hour / day).
-- ============================================================

CREATE TABLE IF NOT EXISTS api_key_rate_limits (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_key_id           BIGINT       NOT NULL,
    requests_per_minute  INT          NOT NULL DEFAULT 60,
    requests_per_hour    INT          NOT NULL DEFAULT 1000,
    requests_per_day     INT          NOT NULL DEFAULT 10000,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rate_limits_api_key FOREIGN KEY (api_key_id) REFERENCES api_keys (id) ON DELETE CASCADE,
    UNIQUE (api_key_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;