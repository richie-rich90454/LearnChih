-- ============================================================
-- LernChih - User profile portfolios (F35)
-- Flyway Migration V20260708110005
-- ============================================================

CREATE TABLE IF NOT EXISTS portfolio_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    item_url        VARCHAR(500),
    display_order   INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_items_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_portfolio_user ON portfolio_items (user_id);
