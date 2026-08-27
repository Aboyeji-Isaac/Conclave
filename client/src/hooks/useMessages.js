import { useCallback, useEffect, useState } from 'react';
import { listMessages } from '../services/messages.service';
import { useRealtime } from '../contexts/RealtimeContext';
export default function useMessages(roomId) {
  const { socket } = useRealtime(); const [messages, setMessages] = useState([]); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; setIsLoading(true); setError(''); listMessages(roomId).then(({ messages: rows }) => active && setMessages([...rows].reverse())).catch((err) => active && setError(err.response?.data?.message || 'Could not load messages.')).finally(() => active && setIsLoading(false)); return () => { active = false; }; }, [roomId]);
  useEffect(() => { if (!socket) return; socket.emit('join-room', { roomId }); const receive = ({ message }) => { if (message.room_id === roomId) setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]); }; socket.on('receive-message', receive); return () => { socket.off('receive-message', receive); socket.emit('leave-room', { roomId }); }; }, [roomId, socket]);
  const sendMessage = useCallback((content) => { if (!socket?.connected) throw new Error('Realtime connection is unavailable.'); socket.emit('send-message', { roomId, content }); }, [roomId, socket]);
  return { messages, isLoading, error, sendMessage };
}
