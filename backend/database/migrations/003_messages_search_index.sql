-- GIN index for full-text search on messages (used by messages.controller.searchMessages)
CREATE INDEX IF NOT EXISTS idx_messages_search
  ON messages USING GIN (to_tsvector('english', content));

-- Composite index for cursor-paginated message listing by room
-- (already have idx_messages_room_created, but this adds deleted_at filtering)
CREATE INDEX IF NOT EXISTS idx_messages_room_created_id
  ON messages (room_id, created_at DESC, id);
