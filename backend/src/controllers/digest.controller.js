const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

// Catch-up Digest — per-room summary since the user's last visit:
// new decisions, mentions, files, and high-activity messages.
//
// v1 (MVP): rule-based. Query everything created after the caller's
// room_members.last_seen_at — new decisions, new/updated tasks, messages
// that @-mention them, new attachments — and return counts + lists.
//
// v2: hand that same query result to the Claude API as context and ask
// for a short narrative summary instead of a raw list.

// ---------- getRoomDigest ----------
// Per-room digest: everything new since the user's last visit
const getRoomDigest = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // 1. Verify membership and get last_seen_at
  const membership = await query(
    `SELECT last_seen_at FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (membership.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this room');
  }
  const lastSeenAt = membership.rows[0].last_seen_at;

  // 2. New decisions since last visit
  const decisions = await query(
    `SELECT d.id, d.title, d.body, d.tags, d.created_at, u.display_name AS author_name
     FROM decisions d
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.room_id = $1 AND d.created_at > $2
     ORDER BY d.created_at DESC`,
    [roomId, lastSeenAt],
  );

  // 3. Tasks assigned to me that were updated since last visit
  const tasks = await query(
    `SELECT t.id, t.title, t.status, t.due_date, t.updated_at, u.display_name AS assignee_name
     FROM tasks t
     INNER JOIN users u ON u.id = t.assignee_id
     WHERE t.room_id = $1 AND t.assignee_id = $2 AND t.updated_at > $3
     ORDER BY t.updated_at DESC`,
    [roomId, req.user.id, lastSeenAt],
  );

  // 4. Messages that @-mention me since last visit
  // Stopgap: matching by @displayName until structured mentions exist (BACKEND_TASKS.md)
  const mentions = await query(
    `SELECT m.id, m.content, m.created_at, u.display_name AS sender_name
     FROM messages m
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = $1
       AND m.created_at > $2
       AND m.content ILIKE '%@' || (SELECT display_name FROM users WHERE id = $3) || '%'
       AND m.sender_id != $3
     ORDER BY m.created_at DESC
     LIMIT 20`,
    [roomId, lastSeenAt, req.user.id],
  );

  // 5. New attachments since last visit
  const files = await query(
    `SELECT a.id, a.filename, a.file_type, a.size_bytes, a.created_at,
            m.content AS message_content, u.display_name AS sender_name
     FROM attachments a
     INNER JOIN messages m ON m.id = a.message_id
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = $1 AND a.created_at > $2
     ORDER BY a.created_at DESC
     LIMIT 20`,
    [roomId, lastSeenAt],
  );

  // 6. Activity count (total new messages since last visit)
  const activity = await query(
    `SELECT COUNT(*)::int AS message_count
     FROM messages
     WHERE room_id = $1 AND created_at > $2`,
    [roomId, lastSeenAt],
  );

  const items = [
    ...decisions.rows.map((d) => ({
      id: d.id,
      type: 'decision',
      title: d.title,
      metadata: d.author_name,
      created_at: d.created_at,
    })),
    ...tasks.rows.map((t) => ({
      id: t.id,
      type: 'task',
      title: t.title,
      metadata: `${t.status} · ${t.assignee_name}`,
      created_at: t.updated_at,
    })),
    ...mentions.rows.map((m) => ({
      id: m.id,
      type: 'mention',
      title: m.content,
      metadata: m.sender_name,
      created_at: m.created_at,
    })),
    ...files.rows.map((f) => ({
      id: f.id,
      type: 'file',
      title: f.filename,
      metadata: f.sender_name,
      created_at: f.created_at,
    })),
    ...(activity.rows[0].message_count > 0
      ? [{
          id: `activity-${roomId}`,
          type: 'activity',
          title: `${activity.rows[0].message_count} new messages`,
          metadata: null,
          created_at: lastSeenAt,
        }]
      : []),
  ];

  // Sort by created_at descending
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return ok(res, {
    items,
    summary: {
      headline: `${items.length} meaningful updates`,
      summary: `${decisions.rows.length} decisions, ${tasks.rows.length} task changes, ${mentions.rows.length} mentions, ${files.rows.length} files.`,
    },
  });
});

// ---------- getUserDigest ----------
// Cross-room: aggregate digest across all rooms the user is in
const getUserDigest = asyncHandler(async (req, res) => {
  // Get all rooms the user is in with their last_seen_at
  const rooms = await query(
    `SELECT room_id, last_seen_at FROM room_members WHERE user_id = $1`,
    [req.user.id],
  );

  const roomIds = rooms.rows.map((r) => r.room_id);
  if (roomIds.length === 0) {
    return ok(res, { items: [], summary: { headline: 'No updates', summary: 'You are not in any rooms.' } });
  }

  // Build per-room last_seen_at map
  const lastSeenMap = {};
  for (const r of rooms.rows) {
    lastSeenMap[r.room_id] = r.last_seen_at;
  }

  // 1. New decisions across all rooms
  const decisions = await query(
    `SELECT d.id, d.title, d.body, d.tags, d.created_at, d.room_id,
            r.name AS room_name, u.display_name AS author_name
     FROM decisions d
     INNER JOIN rooms r ON r.id = d.room_id
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.room_id = ANY($1)
     ORDER BY d.created_at DESC
     LIMIT 50`,
    [roomIds],
  );

  // 2. Tasks assigned to me that were updated
  const tasks = await query(
    `SELECT t.id, t.title, t.status, t.due_date, t.updated_at, t.room_id,
            r.name AS room_name, u.display_name AS assignee_name
     FROM tasks t
     INNER JOIN rooms r ON r.id = t.room_id
     INNER JOIN users u ON u.id = t.assignee_id
     WHERE t.room_id = ANY($1) AND t.assignee_id = $2
     ORDER BY t.updated_at DESC
     LIMIT 50`,
    [roomIds, req.user.id],
  );

  // 3. Messages that @-mention me
  // Stopgap: matching by @displayName until structured mentions exist (BACKEND_TASKS.md)
  const mentions = await query(
    `SELECT m.id, m.content, m.created_at, m.room_id,
            r.name AS room_name, u.display_name AS sender_name
     FROM messages m
     INNER JOIN rooms r ON r.id = m.room_id
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = ANY($1)
       AND m.content ILIKE '%@' || (SELECT display_name FROM users WHERE id = $2) || '%'
       AND m.sender_id != $2
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [roomIds, req.user.id],
  );

  // 4. New attachments
  const files = await query(
    `SELECT a.id, a.filename, a.file_type, a.size_bytes, a.created_at,
            m.room_id, r.name AS room_name, u.display_name AS sender_name
     FROM attachments a
     INNER JOIN messages m ON m.id = a.message_id
     INNER JOIN rooms r ON r.id = m.room_id
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = ANY($1)
     ORDER BY a.created_at DESC
     LIMIT 50`,
    [roomIds],
  );

  // 5. Activity per room (only rooms with new messages since last_seen)
  const activity = await query(
    `SELECT room_id, COUNT(*)::int AS message_count
     FROM messages
     WHERE room_id = ANY($1) AND created_at > (
       SELECT MAX(last_seen_at) FROM room_members WHERE user_id = $2 AND room_id = messages.room_id
     )
     GROUP BY room_id`,
    [roomIds, req.user.id],
  );

  const items = [
    ...decisions.rows.map((d) => ({
      id: d.id,
      type: 'decision',
      title: d.title,
      metadata: `${d.room_name} · ${d.author_name}`,
      created_at: d.created_at,
    })),
    ...tasks.rows.map((t) => ({
      id: t.id,
      type: 'task',
      title: t.title,
      metadata: `${t.room_name} · ${t.status} · ${t.assignee_name}`,
      created_at: t.updated_at,
    })),
    ...mentions.rows.map((m) => ({
      id: m.id,
      type: 'mention',
      title: m.content,
      metadata: `${m.room_name} · ${m.sender_name}`,
      created_at: m.created_at,
    })),
    ...files.rows.map((f) => ({
      id: f.id,
      type: 'file',
      title: f.filename,
      metadata: `${f.room_name} · ${f.sender_name}`,
      created_at: f.created_at,
    })),
    ...activity.rows.map((a) => ({
      id: `activity-${a.room_id}`,
      type: 'activity',
      title: `${a.message_count} new messages`,
      metadata: null,
      created_at: new Date().toISOString(),
    })),
  ];

  // Sort by created_at descending
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return ok(res, {
    items,
    summary: {
      headline: `${items.length} meaningful updates`,
      summary: `${decisions.rows.length} decisions, ${tasks.rows.length} task changes, ${mentions.rows.length} mentions, ${files.rows.length} files.`,
    },
  });
});

module.exports = { getRoomDigest, getUserDigest };
