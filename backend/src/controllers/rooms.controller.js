const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// TODO: create room (type: dm | group | public | private | department),
// insert creator into room_members as admin
const createRoom = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement room creation' }, 201);
});

// TODO: list rooms the authenticated user is a member of
const listRooms = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement room listing' });
});

// TODO: fetch single room + membership check
const getRoom = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement get room' });
});

// TODO: add member to room_members, emit socket event to room
const addMember = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement add member' }, 201);
});

module.exports = { createRoom, listRooms, getRoom, addMember };
