import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds — must be shorter than the server's 45s TTL

/**
 * Sends a `heartbeat` event to the Socket.IO server every 30s so the
 * server knows this client is still alive. If the heartbeat stops
 * (tab closed, network drop, component unmounted), the server's
 * sweep timer will remove the user from online_users within 45s.
 *
 * Usage:
 *   const socket = getSocket();
 *   useHeartbeat(socket);
 */
export default function useHeartbeat(socket) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!socket?.connected) return;

    // Send one immediately on mount so the server picks up the
    // client right away, then every 30s after that.
    socket.emit('heartbeat');

    intervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket, socket?.connected]);
}
