-- The differentiator layer: Decisions, Action Items, and the data the
-- Catch-up Digest reads from. This is what separates the product from
-- WhatsApp/Facebook/Slack — see docs/PKB for the product rationale.

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  source_message_id UUID REFERENCES messages(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_decisions_room ON decisions(room_id);
-- Full-text search across title + body; searchable independent of chat scroll.
CREATE INDEX idx_decisions_search ON decisions USING GIN (to_tsvector('english', title || ' ' || body));

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  source_message_id UUID REFERENCES messages(id),
  title TEXT NOT NULL,
  assignee_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'in_progress' | 'done'
  due_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tasks_room_status ON tasks(room_id, status);

-- Cache table for generated digests — not the source of truth, safe to
-- truncate/regenerate at any time.
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  content_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_digests_room_user ON digests(room_id, user_id);
