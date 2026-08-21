import { io } from 'socket.io-client';

// Singleton socket instance. Call connectSocket() after login,
// disconnectSocket() on logout. getSocket() returns the current
// instance (or null if not connected).
//
// Server event list: backend/src/sockets/index.js

let socket = null;

/**
 * Create and connect the Socket.IO client. Idempotent — calling this
 * again after a previous connection will close the old one first.
 */
export function connectSocket(accessToken) {
  // Tear down any existing connection
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: accessToken },
    // socket.io-client reconnection defaults:
    //   reconnection: true, reconnectionAttempts: Infinity,
    //   reconnectionDelay: 1000, reconnectionDelayMax: 5000
    // These are fine for now — the heartbeat hook keeps presence
    // alive, and the server sweeps stale users every 30s.
  });

  // Log connection lifecycle for debugging (remove in production)
  socket.on('connect', () => {
    console.log('[socket] connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] connection error:', err.message);
  });

  return socket;
}

/**
 * Gracefully disconnect and clean up.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the current socket instance (may be null).
 */
export function getSocket() {
  return socket;
}
