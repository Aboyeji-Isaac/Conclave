-- Add filename column to attachments so the frontend can display a
-- human-readable name instead of the raw file_url.

ALTER TABLE attachments ADD COLUMN filename TEXT;

-- Backfill from file_url: grab the last path segment as a best-effort filename.
UPDATE attachments
   SET filename = regexp_replace(file_url, '^.+/', '')
 WHERE filename IS NULL;
