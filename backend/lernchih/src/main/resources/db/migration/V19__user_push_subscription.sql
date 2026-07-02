-- Add Web Push subscription JSON to users (Task 8.11)
ALTER TABLE users ADD COLUMN push_subscription TEXT;
