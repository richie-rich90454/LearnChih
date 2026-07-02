-- ============================================================
-- LernChih Forum - Rich Content Columns for Posts/Threads
-- Flyway Migration V13 (Task 8.1)
-- ============================================================
-- Adds a format column to post tables and content/format columns
-- to thread tables to support markdown/plain authoring.

ALTER TABLE channel_posts ADD COLUMN format VARCHAR(20) NOT NULL DEFAULT 'PLAIN';
ALTER TABLE resource_posts ADD COLUMN format VARCHAR(20) NOT NULL DEFAULT 'PLAIN';

ALTER TABLE channel_threads ADD COLUMN content TEXT;
ALTER TABLE channel_threads ADD COLUMN format VARCHAR(20) NOT NULL DEFAULT 'PLAIN';

ALTER TABLE resource_threads ADD COLUMN content TEXT;
ALTER TABLE resource_threads ADD COLUMN format VARCHAR(20) NOT NULL DEFAULT 'PLAIN';
