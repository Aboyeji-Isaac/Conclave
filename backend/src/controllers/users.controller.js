const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

const UPDATABLE_FIELDS = ['display_name', 'avatar_url', 'bio'];
const PAGE_SIZE = 25;

// ---------- getMe ----------
const getMe = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, email, display_name, avatar_url, bio, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  return ok(res, result.rows[0]);
});

// ---------- updateProfile ----------
// Whitelist-only update: only display_name, avatar_url, bio can change here.
// Email/password changes need their own, more carefully guarded endpoints
// later (not added yet — changing email should probably re-verify it,
// changing password needs the current password confirmed).
const updateProfile = asyncHandler(async (req, res) => {
  // 1. Whitelist: pull out only the fields we allow, ignore everything else
  const updates = {};
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(
      400,
      `No updatable fields provided. Allowed: ${UPDATABLE_FIELDS.join(', ')}`
    );
  }

  if ('display_name' in updates && !String(updates.display_name).trim()) {
    throw new ApiError(400, 'display_name cannot be empty');
  }

  // 2. Build a dynamic SET clause from only the whitelisted fields present
  //    in this request — never string-interpolate values, only column names
  //    from our own constant list above.
  const setClauses = [];
  const values = [];
  let i = 1;
  for (const [field, value] of Object.entries(updates)) {
    setClauses.push(`${field} = $${i}`);
    values.push(field === 'display_name' ? String(value).trim() : value);
    i += 1;
  }
  values.push(req.user.id);

  // 3. Apply the update, return the fresh row
  const result = await query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${i}
     RETURNING id, email, display_name, avatar_url, bio, created_at`,
    values
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }

  return ok(res, result.rows[0]);
});

// ---------- listUsers ----------
// Paginated user directory, optionally filtered by a search term matching
// display_name or email. Primary use case: "add member to room" pickers.
const listUsers = asyncHandler(async (req, res) => {
  const { q, page = '1' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const params = [];
  let where = '';
  if (q && q.trim()) {
    params.push(`%${q.trim()}%`);
    where = `WHERE display_name ILIKE $${params.length} OR email ILIKE $${params.length}`;
  }

  params.push(PAGE_SIZE, offset);
  const result = await query(
    `SELECT id, display_name, avatar_url, email, created_at
     FROM users
     ${where}
     ORDER BY display_name ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return ok(res, {
    users: result.rows,
    page: pageNum,
    pageSize: PAGE_SIZE,
    hasMore: result.rows.length === PAGE_SIZE,
  });
});

module.exports = { getMe, updateProfile, listUsers };
