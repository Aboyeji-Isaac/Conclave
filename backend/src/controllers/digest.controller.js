const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// Catch-up Digest — per-room summary since the user's last visit:
// new decisions, mentions, files, and high-activity messages.
//
// v1 (MVP): rule-based. Query everything created after the caller's
// room_members.last_seen_at — new decisions, new/updated tasks, messages
// that @-mention them, new attachments — and return counts + lists.
//
// v2: hand that same query result to the Claude API as context and ask
// for a short narrative summary instead of a raw list.

// TODO: implement the rule-based digest query described above
const getRoomDigest = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement catch-up digest for a room' });
});

module.exports = { getRoomDigest };
