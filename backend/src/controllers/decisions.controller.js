const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// The Decisions Layer — promote any message to a tagged, searchable
// Decision stored outside the chat timeline. This is one of the three
// differentiator features from the PKB (see docs/).

// TODO: insert into `decisions`, linked to source_message_id + room_id + tags[]
const promoteToDecision = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement promote-message-to-decision' }, 201);
});

// TODO: list decisions for a room, filterable by tag
const listDecisions = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement decision listing' });
});

// TODO: full-text search across decisions (title, body, tags) — independent
// of chat history, this is the whole point
const searchDecisions = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement decision search' });
});

module.exports = { promoteToDecision, listDecisions, searchDecisions };
