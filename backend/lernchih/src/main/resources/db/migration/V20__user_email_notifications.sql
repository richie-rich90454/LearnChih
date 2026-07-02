-- Add email notification preference to users (Task 8.11)
ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;
