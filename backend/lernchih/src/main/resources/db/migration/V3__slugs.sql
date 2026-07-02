-- ============================================================
-- LernChih Forum - SEO Slugs
-- Flyway Migration V3
-- ============================================================
-- Adds a unique, human-readable slug to resources and channels so
-- public deep links can use /resources/{slug} and /channels/{slug}
-- instead of raw numeric ids. Existing rows are backfilled with a
-- safe "<prefix>-<id>" slug before the column is made NOT NULL.

-- resources.slug
ALTER TABLE resources ADD COLUMN slug VARCHAR(255) NULL;

UPDATE resources SET slug = CONCAT('resource-', id) WHERE slug IS NULL;

ALTER TABLE resources MODIFY COLUMN slug VARCHAR(255) NOT NULL;

CREATE UNIQUE INDEX idx_resources_slug ON resources (slug);

-- channels.slug
ALTER TABLE channels ADD COLUMN slug VARCHAR(255) NULL;

UPDATE channels SET slug = CONCAT('channel-', id) WHERE slug IS NULL;

ALTER TABLE channels MODIFY COLUMN slug VARCHAR(255) NOT NULL;

CREATE UNIQUE INDEX idx_channels_slug ON channels (slug);
