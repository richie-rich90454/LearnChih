-- Add action_url column to notifications for deep-linking (Task 8.10)
ALTER TABLE notifications ADD COLUMN action_url VARCHAR(500);
