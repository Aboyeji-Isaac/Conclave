const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

// The Decisions Layer — promote any message to a tagged, searchable
// Decision stored outside the chat timeline. This is one of the three
// differentiator features from the PKB (see docs/).

// ---------- promoteToDecision ----------
// Promote a message to a decision, linked to source_message_id + room_id + tags[]
const promoteToDecision = asyncHandler(async (req, res) => {
  const { roomId, sourceMessageId, title, body, tags } = req.body;

  if (!roomId || !title || !body) {
    throw new ApiError(400, 'roomId, title, and body are required');
  }

  // Verify the caller is a member of the room
  const membership = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (membership.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this room');
  }

  const result = await query(
    `INSERT INTO decisions (room_id, source_message_id, title, body, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [roomId, sourceMessageId || null, title, body, tags || [], req.user.id],
  );

  return ok(res, result.rows[0], 201);
});

// ---------- listDecisions ----------
// Cross-room: list all decisions across rooms the user is in.
// Optional ?roomId filter for single-room view.
const listDecisions = asyncHandler(async (req, res) => {
  const { roomId } = req.query;

  if (roomId) {
    // Single-room mode: verify membership
    const membership = await query(
      `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
      [roomId, req.user.id],
    );
    if (membership.rows.length === 0) {
      throw new ApiError(403, 'You are not a member of this room');
    }

    const result = await query(
      `SELECT d.*, r.name AS room_name, u.display_name AS author_name
       FROM decisions d
       INNER JOIN rooms r ON r.id = d.room_id
       INNER JOIN users u ON u.id = d.created_by
       WHERE d.room_id = $1
       ORDER BY d.created_at DESC
       LIMIT 50`,
      [roomId],
    );
    return ok(res, { decisions: result.rows });
  }

  // Cross-room mode: all decisions from rooms the user is in
  const result = await query(
    `SELECT d.*, r.name AS room_name, u.display_name AS author_name
     FROM decisions d
     INNER JOIN rooms r ON r.id = d.room_id
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.room_id IN (SELECT room_id FROM room_members WHERE user_id = $1)
     ORDER BY d.created_at DESC
     LIMIT 50`,
    [req.user.id],
  );

  return ok(res, { decisions: result.rows });
});

// ---------- searchDecisions ----------
// Full-text search across decisions (title, body, tags)
const searchDecisions = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { q } = req.query;

  if (!q || !q.trim()) {
    throw new ApiError(400, 'Search query (q) is required');
  }

  // Verify membership
  const membership = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (membership.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this room');
  }

  const result = await query(
    `SELECT d.*, r.name AS room_name, u.display_name AS author_name,
       ts_rank(
         to_tsvector('english', d.title || ' ' || d.body),
         plainto_tsquery('english', $2)
       ) AS rank
     FROM decisions d
     INNER JOIN rooms r ON r.id = d.room_id
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.room_id = $1
       AND to_tsvector('english', d.title || ' ' || d.body) @@ plainto_tsquery('english', $2)
     ORDER BY rank DESC, d.created_at DESC
     LIMIT 50`,
    [roomId, q.trim()],
  );

  return ok(res, { decisions: result.rows, query: q.trim() });
});

module.exports = { promoteToDecision, listDecisions, searchDecisions };
