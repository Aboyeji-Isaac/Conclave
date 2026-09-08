import { useEffect } from 'react';
const HEARTBEAT_INTERVAL_MS = 30_000;
export default function useHeartbeat(socket) {
  useEffect(() => { if (!socket) return; let timer;
    const stop = () => { if (timer) clearInterval(timer); timer = undefined; };
    const start = () => { stop(); socket.emit('heartbeat'); timer = setInterval(() => socket.connected && socket.emit('heartbeat'), HEARTBEAT_INTERVAL_MS); };
    socket.on('connect', start); socket.on('disconnect', stop); if (socket.connected) start();
    return () => { stop(); socket.off('connect', start); socket.off('disconnect', stop); };
  }, [socket]);
}
