const { pool, query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

// Valid room types matching the DB CHECK / schema comment
const VALID_TYPES = ["dm", "group"];

// ---------- createRoom ----------
// Creates a room and inserts the creator as an admin member in one transaction.
const createRoom = asyncHandler(async (req, res) => {
  const { name, type, memberIds } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Room name is required");
  }
  const roomType = type || (memberIds?.length === 1 ? "dm" : "group"); // Default to "dm" if exactly 1 other member, else "group"
  if (!VALID_TYPES.includes(roomType)) {
    throw new ApiError(
      400,
      `Invalid room type. Must be one of: ${VALID_TYPES.join(", ")}`,
    );
  }

  // For DM rooms, ensure exactly 1 other member is provided
  if (roomType === "dm") {
    if (!Array.isArray(memberIds) || memberIds.length !== 1) {
      throw new ApiError(
        400,
        "DM rooms must have exactly one other member (memberIds: [userId])",
      );
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert the room
    const roomResult = await client.query(
      `INSERT INTO rooms (name, type, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, type, created_by, created_at`,
      [name.trim(), roomType, req.user.id],
    );
    const room = roomResult.rows[0];

    // 2. Insert creator as admin member
    await client.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [room.id, req.user.id],
    );

    // 3. If memberIds provided, add them as regular members
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      for (const memberId of memberIds) {
        // Skip the creator (already added as admin above)
        if (memberId === req.user.id) continue;
        await client.query(
          `INSERT INTO room_members (room_id, user_id, role)
           VALUES ($1, $2, 'member')
           ON CONFLICT (room_id, user_id) DO NOTHING`,
          [room.id, memberId],
        );
      }
    }

    await client.query("COMMIT");

    return ok(
      res,
      { ...room, members: [req.user.id, ...(memberIds || [])] },
      201,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// ---------- listRooms ----------
// Returns all rooms the authenticated user is a member of, with member count
// and the user's role in each room.
const listRooms = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       r.id,
       r.name,
       r.created_by,
       r.created_at,
       rm.role AS my_role,
       rm.joined_at,
       rm.last_seen_at,
       COUNT(all_members.user_id)::int AS member_count
     FROM rooms r
     INNER JOIN room_members rm
       ON rm.room_id = r.id
      AND rm.user_id = $1
     INNER JOIN room_members all_members
       ON all_members.room_id = r.id
     GROUP BY
       r.id,
       r.name,
       r.created_by,
       r.created_at,
       rm.role,
       rm.joined_at,
       rm.last_seen_at
     ORDER BY r.created_at DESC`,
    [req.user.id],
  );

  return ok(res, result.rows);
});

// ---------- getRoom ----------
// Fetches a single room. Verifies the caller is a member.
// Returns room details + list of members.
const getRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // 1. Load the room, caller membership, and members in one database round trip.
  // The caller membership uses a LEFT JOIN so we can distinguish a missing room
  // from an existing room that the caller is not allowed to view.
  const result = await query(
    `SELECT
       r.id,
       r.name,
       r.type,
       r.created_by,
       r.created_at,
       caller_membership.role AS my_role,
       COALESCE(
         json_agg(
           json_build_object(
             'id', u.id,
             'display_name', u.display_name,
             'avatar_url', u.avatar_url,
             'role', room_members.role,
             'joined_at', room_members.joined_at,
             'last_seen_at', room_members.last_seen_at
           )
           ORDER BY room_members.role = 'admin' DESC,
                    room_members.joined_at ASC
         ) FILTER (WHERE u.id IS NOT NULL),
         '[]'::json
       ) AS members
     FROM rooms r
     LEFT JOIN room_members caller_membership
       ON caller_membership.room_id = r.id
      AND caller_membership.user_id = $2
     LEFT JOIN room_members
       ON room_members.room_id = r.id
     LEFT JOIN users u
       ON u.id = room_members.user_id
     WHERE r.id = $1
     GROUP BY
       r.id,
       r.name,
       r.type,
       r.created_by,
       r.created_at,
       caller_membership.role`,
    [roomId, req.user.id],
  );

  // 2. Verify that the room exists.
  if (result.rows.length === 0) {
    throw new ApiError(404, "Room not found");
  }

  // 3. Verify that the authenticated user is a room member.
  const { my_role, members, ...room } = result.rows[0];
  if (!my_role) {
    throw new ApiError(403, "You are not a member of this room");
  }

  // 4. Return the room details and its member list.
  return ok(res, { ...room, members });
});

// ---------- addMember ----------
// Adds a user to a room. The caller must be an admin of the room.
const addMember = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  // 1. Check caller is admin of this room
  const callerMembership = await query(
    `SELECT role FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, req.user.id],
  );
  if (callerMembership.rows.length === 0) {
    throw new ApiError(403, "You are not a member of this room");
  }
  if (callerMembership.rows[0].role !== "admin") {
    throw new ApiError(403, "Only room admins can add members");
  }

  // 2. Verify the target room exists
  const roomResult = await query(`SELECT id, type FROM rooms WHERE id = $1`, [
    roomId,
  ]);
  if (roomResult.rows.length === 0) {
    throw new ApiError(404, "Room not found");
  }

  // 3. Verify the target user exists
  const userResult = await query(
    `SELECT id, display_name FROM users WHERE id = $1`,
    [userId],
  );
  if (userResult.rows.length === 0) {
    throw new ApiError(404, "User not found");
  }

  // 4. Check if already a member
  const existing = await query(
    `SELECT user_id FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId],
  );
  if (existing.rows.length > 0) {
    throw new ApiError(409, "User is already a member of this room");
  }

  // 5. Add as member
  await query(
    `INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, 'member')`,
    [roomId, userId],
  );

  // 6. Create notification for the added user
  await query(
    `INSERT INTO notifications (recipient_id, type, reference_id)
     VALUES ($1, 'room_invite', $2)`,
    [userId, roomId],
  );

  return ok(
    res,
    {
      roomId,
      userId,
      displayName: userResult.rows[0].display_name,
      role: "member",
    },
    201,
  );
});

module.exports = { createRoom, listRooms, getRoom, addMember };
