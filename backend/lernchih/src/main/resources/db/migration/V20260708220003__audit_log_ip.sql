-- F90: Add ip_address column to the audit_logs table.
-- The audit_logs table was created in V12 with actor_id, action, target_type,
-- target_id, details_json, and created_at. This migration adds ip_address so
-- each audit entry records where the request originated from.

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
