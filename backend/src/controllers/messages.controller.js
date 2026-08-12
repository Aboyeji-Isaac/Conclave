const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// REST fallback for sending a message — the primary path is the
// `send-message` Socket.IO event (see src/sockets/index.js). Keep both
// writing through the same service function so history stays consistent.
const sendMessage = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement message send (REST fallback)' }, 201);
});

// TODO: paginate by created_at/cursor, join attachments + reactions
const listMessages = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement message listing for a room' });
});

// TODO: full-text search across a room's messages (Postgres tsvector)
const searchMessages = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement message search' });
});

module.exports = { sendMessage, listMessages, searchMessages };
