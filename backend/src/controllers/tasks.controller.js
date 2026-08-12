const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// In-chat Action Items — flag any message as a task, assign it, track
// status in a per-room Tasks tab.

// TODO: insert into `tasks`, linked to source_message_id, assignee_id
const createTask = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement task creation from message' }, 201);
});

// TODO: list tasks for a room, filterable by status/assignee
const listTasks = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement task listing' });
});

// TODO: update status (open -> in_progress -> done), emit socket event
// so the Tasks tab updates live for everyone in the room
const updateTaskStatus = asyncHandler(async (req, res) => {
  return ok(res, { message: 'TODO: implement task status update' });
});

module.exports = { createTask, listTasks, updateTaskStatus };
