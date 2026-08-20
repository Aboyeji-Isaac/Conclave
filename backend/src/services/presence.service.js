const { redisClient } = require('../config/redis');

// Redis key schema:
//   online_users                    SET   — all connected user IDs
//   room:{roomId}:online            SET   — user IDs currently in this Socket.IO room
//   typing:{roomId}:{userId}        STRING with TTL — typing indicator
//   presence:{userId}:heartbeat     STRING with TTL — last heartbeat timestamp
//
// Heartbeat: client sends a `heartbeat` event every 30s.
// Server sets `presence:{userId}:heartbeat` with a 45s TTL.
// A periodic sweep removes users from `online_users` whose
// heartbeat key has expired (network drop without clean disconnect).

const HEARTBEAT_TTL_SECONDS = 45;
const HEARTBEAT_SWEEP_INTERVAL_MS = 30_000; // check every 30s
const TYPING_TTL_SECONDS = 5;

// ---------- Presence ----------

async function userConnected(userId) {
  if (!redisClient.isOpen) return;
  await redisClient.sAdd('online_users', userId);
  await redisClient.set(
    `presence:${userId}:heartbeat`,
    Date.now().toString(),
    { EX: HEARTBEAT_TTL_SECONDS },
  );
}

async function userDisconnected(userId) {
  if (!redisClient.isOpen) return;
  await redisClient.sRem('online_users', userId);
  await redisClient.del(`presence:${userId}:heartbeat`);
}

async function refreshHeartbeat(userId) {
  if (!redisClient.isOpen) return;
  await redisClient.set(
    `presence:${userId}:heartbeat`,
    Date.now().toString(),
    { EX: HEARTBEAT_TTL_SECONDS },
  );
}

/**
 * Sweep online_users: remove anyone whose heartbeat key has expired.
 * Call this on a timer. Returns the list of stale userIds that were removed.
 */
async function sweepStaleUsers() {
  if (!redisClient.isOpen) return [];

  const onlineUserIds = await redisClient.sMembers('online_users');
  const stale = [];

  for (const uid of onlineUserIds) {
    const exists = await redisClient.exists(`presence:${uid}:heartbeat`);
    if (!exists) {
      stale.push(uid);
      await redisClient.sRem('online_users', uid);
    }
  }

  return stale;
}

async function isUserOnline(userId) {
  if (!redisClient.isOpen) return false;
  return (await redisClient.sIsMember('online_users', userId)) === 1;
}

async function getOnlineUsers() {
  if (!redisClient.isOpen) return [];
  return redisClient.sMembers('online_users');
}

// ---------- Per-room presence ----------

async function userJoinedRoom(userId, roomId) {
  if (!redisClient.isOpen) return;
  await redisClient.sAdd(`room:${roomId}:online`, userId);
}

async function userLeftRoom(userId, roomId) {
  if (!redisClient.isOpen) return;
  await redisClient.sRem(`room:${roomId}:online`, userId);
}

async function getRoomOnlineUsers(roomId) {
  if (!redisClient.isOpen) return [];
  return redisClient.sMembers(`room:${roomId}:online`);
}

/**
 * Clean up a user from all room presence sets (called on disconnect).
 * Returns the list of roomIds they were in, so the caller can
 * broadcast user-offline to each room if needed.
 */
async function cleanupUserFromRooms(userId) {
  if (!redisClient.isOpen) return [];

  // Find all room:*:online sets that contain this user
  const roomKeys = await redisClient.keys('room:*:online');
  const leftRooms = [];

  for (const key of roomKeys) {
    const wasMember = await redisClient.sIsMember(key, userId);
    if (wasMember) {
      await redisClient.sRem(key, userId);
      // Extract roomId from key format "room:{roomId}:online"
      const roomId = key.split(':')[1];
      leftRooms.push(roomId);
    }
  }

  return leftRooms;
}

// ---------- Typing indicators ----------

async function setTyping(roomId, userId) {
  if (!redisClient.isOpen) return;
  await redisClient.set(
    `typing:${roomId}:${userId}`,
    '1',
    { EX: TYPING_TTL_SECONDS },
  );
}

async function clearTyping(roomId, userId) {
  if (!redisClient.isOpen) return;
  await redisClient.del(`typing:${roomId}:${userId}`);
}

/**
 * Get all users currently typing in a room.
 * Returns an array of userId strings.
 */
async function getTypingUsers(roomId) {
  if (!redisClient.isOpen) return [];
  const keys = await redisClient.keys(`typing:${roomId}:*`);
  // Extract userId from key format "typing:{roomId}:{userId}"
  return keys.map((k) => k.split(':')[2]);
}

/**
 * Clean up all typing indicators for a user across all rooms (on disconnect).
 */
async function cleanupUserTyping(userId) {
  if (!redisClient.isOpen) return;
  const keys = await redisClient.keys(`typing:*:${userId}`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

// ---------- Sweep timer ----------

let sweepTimer = null;

function startHeartbeatSweep(io) {
  if (sweepTimer) return;

  sweepTimer = setInterval(async () => {
    const staleUsers = await sweepStaleUsers();
    for (const userId of staleUsers) {
      io.emit('user-offline', { userId });
    }
  }, HEARTBEAT_SWEEP_INTERVAL_MS);

  // Don't keep the process alive just for the sweep timer
  if (sweepTimer.unref) sweepTimer.unref();
}

function stopHeartbeatSweep() {
  if (sweepTimer) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

module.exports = {
  // Presence
  userConnected,
  userDisconnected,
  refreshHeartbeat,
  sweepStaleUsers,
  isUserOnline,
  getOnlineUsers,
  startHeartbeatSweep,
  stopHeartbeatSweep,
  // Per-room presence
  userJoinedRoom,
  userLeftRoom,
  getRoomOnlineUsers,
  cleanupUserFromRooms,
  // Typing
  setTyping,
  clearTyping,
  getTypingUsers,
  cleanupUserTyping,
};
