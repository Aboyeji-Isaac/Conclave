const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

const getMe = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, email, display_name, avatar_url, bio, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  return ok(res, result.rows[0]);
});

// TODO: validate + whitelist updatable fields (display_name, avatar_url, bio)
const updateProfile = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement profile update' });
});

// TODO: paginate, support search by display_name/email
const listUsers = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement user listing/search' });
});

module.exports = { getMe, updateProfile, listUsers };
