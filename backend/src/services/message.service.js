const { pool, query } = require('../config/db');
const ApiError = require('../utils/ApiError');

/**
 * Persist a message and return the full row with sender metadata.
 * Used by both messages.controller.sendMessage (REST) and
 * sockets/index.js send-message event — never broadcast unsaved
 * client input; always write through this function.
 *
 * @param {object} params
 * @param {string} params.roomId
 * @param {string} params.senderId - UUID of the sending user
 * @param {string} params.content   - message body text
 * @param {string} [params.replyToId] - UUID of the message being replied to
 * @param {Array}  [params.attachments] - array of { filename, url, mime_type, size }
 * @returns {object} The inserted message row enriched with sender info and attachments
 */
async function createMessage({ roomId, senderId, content, replyToId, attachments }) {
  if (!content || !content.trim()) {
    throw new ApiError(400, 'Message content is required');
  }

  // 1. Verify room exists and sender is a member (1 query)
  const membership = await query(
    `SELECT r.id AS room_id
     FROM rooms r
     INNER JOIN room_members rm ON rm.room_id = r.id AND rm.user_id = $2
     WHERE r.id = $1`,
    [roomId, senderId],
  );

  if (membership.rows.length === 0) {
    throw new ApiError(404, 'Room not found or you are not a member');
  }

  // 2. If replying, verify the parent message exists in the same room
  if (replyToId) {
    const parent = await query(
      `SELECT id FROM messages WHERE id = $1 AND room_id = $2`,
      [replyToId, roomId],
    );
    if (parent.rows.length === 0) {
      throw new ApiError(400, 'Reply target message not found in this room');
    }
  }

  // 3. Insert message + attachments in a transaction
  const client = await pool.connect();
  let message;
  let savedAttachments = [];

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO messages (room_id, sender_id, content, reply_to_id)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id, room_id, sender_id, content, reply_to_id,
         edited_at, deleted_at, created_at`,
      [roomId, senderId, content.trim(), replyToId || null],
    );
    message = result.rows[0];

    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const a of attachments) {
        const attResult = await client.query(
          `INSERT INTO attachments (message_id, filename, file_url, file_type, size_bytes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, filename, file_url, file_type, size_bytes`,
          [message.id, a.filename, a.url, a.mime_type, a.size || null],
        );
        savedAttachments.push(attResult.rows[0]);
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // 4. Fetch sender display_name + avatar for the broadcast
  const sender = await query(
    `SELECT display_name, avatar_url FROM users WHERE id = $1`,
    [senderId],
  );

  return {
    ...message,
    sender: sender.rows[0] || null,
    attachments: savedAttachments,
  };
}

module.exports = { createMessage };
