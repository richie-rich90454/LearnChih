-- F89: Add SLA tracking columns to the mod_queue table.
-- The mod_queue table was created in V12 with basic columns (content_type,
-- content_id, reported_by, reason, status, created_at). This migration adds
-- assigned_to, sla_deadline, and resolved_at so admins can track who is
-- working on each item, when it must be resolved by, and when it was closed.

ALTER TABLE mod_queue ADD COLUMN IF NOT EXISTS assigned_to BIGINT;
ALTER TABLE mod_queue ADD COLUMN IF NOT EXISTS sla_deadline DATETIME;
ALTER TABLE mod_queue ADD COLUMN IF NOT EXISTS resolved_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_mod_queue_sla ON mod_queue (sla_deadline);
CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned ON mod_queue (assigned_to);
