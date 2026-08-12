const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// TODO: list notifications for req.user.id, newest first, seen/unseen flag
const listNotifications = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement notification listing' });
});

// TODO: mark one or all notifications as seen
const markSeen = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement mark-as-seen' });
});

module.exports = { listNotifications, markSeen };
