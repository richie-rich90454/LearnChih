-- Add read-receipt columns to thread tables for lightweight per-thread tracking (Task 8.12)
ALTER TABLE resource_posts ADD COLUMN read_by_user_ids TEXT;
ALTER TABLE channel_posts ADD COLUMN read_by_user_ids TEXT;
ALTER TABLE resource_threads ADD COLUMN last_read_at DATETIME;
ALTER TABLE channel_threads ADD COLUMN last_read_at DATETIME;
