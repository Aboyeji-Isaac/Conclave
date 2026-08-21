const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const { createMessage } = require('../services/message.service');

const PAGE_SIZE = 50;

// ---------- sendMessage ----------
// REST fallback for sending a message — the primary path is the
// send-message Socket.IO event (see src/sockets/index.js). Both
// write through message.service.createMessage so history stays consistent.
const sendMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const { content, replyToId } = req.body;

  if (!roomId) {
    throw new ApiError(400, 'roomId is required');
  }

  const message = await createMessage({
    roomId,
    senderId: req.user.id,
    content,
    replyToId,
  });

  return ok(res, message, 201);
});

// ---------- listMessages ----------
// Cursor-paginated message history for a room. The client sends
// `?before=<ISO timestamp>` to page backwards through time.
// Returns newest-first, with the most recent PAGE_SIZE messages by default.
const listMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { before } = req.query; // ISO timestamp cursor

  // 1. Verify the caller is a member of this room
  const membership = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (membership.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this room');
  }

  // 2. Fetch messages — cursor-based pagination via created_at
  let sql = `
    SELECT
      m.id,
      m.room_id,
      m.sender_id,
      u.display_name AS sender_name,
      u.avatar_url   AS sender_avatar,
      m.content,
      m.reply_to_id,
      m.edited_at,
      m.deleted_at,
      m.created_at
    FROM messages m
    INNER JOIN users u ON u.id = m.sender_id
    WHERE m.room_id = $1
  `;
  const params = [roomId];

  if (before) {
    params.push(before);
    sql += ` AND m.created_at < $${params.length}`;
  }

  sql += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
  params.push(PAGE_SIZE);

  const result = await query(sql, params);

  // 3. Return with cursor for the next page
  const messages = result.rows;
  const nextCursor =
    messages.length === PAGE_SIZE
      ? messages[messages.length - 1].created_at
      : null;

  return ok(res, { messages, nextCursor });
});

// ---------- searchMessages ----------
// Full-text search across a room's messages using Postgres tsvector.
// Query: ?q=<search term>
const searchMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { q } = req.query;

  if (!q || !q.trim()) {
    throw new ApiError(400, 'Search query (q) is required');
  }

  // 1. Verify the caller is a member of this room
  const membership = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (membership.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this room');
  }

  // 2. Full-text search with ts_rank for relevance ordering
  const result = await query(
    `SELECT
       m.id,
       m.room_id,
       m.sender_id,
       u.display_name AS sender_name,
       u.avatar_url   AS sender_avatar,
       m.content,
       m.reply_to_id,
       m.created_at,
       ts_rank(
         to_tsvector('english', m.content),
         plainto_tsquery('english', $2)
       ) AS rank
     FROM messages m
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.room_id = $1
       AND to_tsvector('english', m.content) @@ plainto_tsquery('english', $2)
     ORDER BY rank DESC, m.created_at DESC
     LIMIT 50`,
    [roomId, q.trim()],
  );

  return ok(res, { messages: result.rows, query: q.trim() });
});

module.exports = { sendMessage, listMessages, searchMessages };
