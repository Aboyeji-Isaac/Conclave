-- Add soft-delete support to users. A deleted account keeps its rows
-- so foreign keys on messages, decisions, and tasks stay valid.
-- The user's display shows as "Deleted user" in existing JOINs.

ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
