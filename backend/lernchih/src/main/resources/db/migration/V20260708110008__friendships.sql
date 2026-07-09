-- ============================================================
-- LernChih - Friends / study-buddies list (F38)
-- Flyway Migration V20260708110008
-- ============================================================

CREATE TABLE IF NOT EXISTS friendships (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id BIGINT       NOT NULL,
    addressee_id BIGINT       NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_friendships_pair UNIQUE (requester_id, addressee_id),
    CONSTRAINT fk_friendships_requester FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_addressee FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status
    ON friendships (addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status
    ON friendships (requester_id, status);
