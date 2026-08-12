const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { redisClient } = require('../config/redis');

// Event names match what was scoped in the original planning conversation,
// plus two new events for the differentiator features (decision:created,
// task:updated) so room UIs can update live without polling.
//
// Client -> Server:
//   join-room        { roomId }
//   leave-room       { roomId }
//   send-message     { roomId, content, replyToId? }
//   typing            { roomId }
//   stop-typing       { roomId }
//   message-read      { roomId, messageId }
//
// Server -> Client:
//   receive-message   { message }
//   user-online        { userId }
//   user-offline       { userId }
//   notification        { notification }
//   upload-progress      { messageId, percent }
//   decision:created       { decision }   (new — Decisions Layer)
//   task:updated             { task }       (new — Action Items)

function registerSocketHandlers(io) {
  // Auth: client connects with `io(url, { auth: { token } })`.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Missing auth token'));
    try {
      const payload = jwt.verify(token, env.jwt.accessSecret);
      socket.user = { id: payload.sub, email: payload.email };
      return next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const { id: userId } = socket.user;

    if (redisClient.isOpen) {
      await redisClient.sAdd('online_users', userId);
    }
    socket.broadcast.emit('user-online', { userId });

    socket.on('join-room', ({ roomId }) => {
      // TODO: verify socket.user.id is actually a member of roomId before joining
      socket.join(roomId);
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('send-message', async ({ roomId, content, replyToId }) => {
      // TODO: persist via the same service used by the REST fallback
      // (messages.controller.sendMessage), then broadcast the saved row —
      // never trust/broadcast unsaved client input directly.
      const message = {
        roomId,
        senderId: userId,
        content,
        replyToId: replyToId || null,
        createdAt: new Date().toISOString(),
      };
      io.to(roomId).emit('receive-message', { message });
    });

    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing', { roomId, userId });
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('stop-typing', { roomId, userId });
    });

    socket.on('message-read', ({ roomId, messageId }) => {
      // TODO: persist read receipt
      socket.to(roomId).emit('message-read', { roomId, messageId, userId });
    });

    socket.on('disconnect', async () => {
      if (redisClient.isOpen) {
        await redisClient.sRem('online_users', userId);
      }
      socket.broadcast.emit('user-offline', { userId });
    });
  });
}

module.exports = registerSocketHandlers;
