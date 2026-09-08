import { useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import CatchUpDigest from '../components/chat/CatchUpDigest';
import MessageComposer from '../components/chat/MessageComposer';
import MessageTimeline from '../components/chat/MessageTimeline';
import RoomHeader from '../components/chat/RoomHeader';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import useMessages from '../hooks/useMessages';
import useRoom from '../hooks/useRoom';

export default function Room() {
  const { roomId } = useParams(); const { user } = useAuth(); const { isConnected } = useRealtime();
  const { setRoomHeader } = useOutletContext();
  const { room, isLoading: roomLoading, error: roomError } = useRoom(roomId);
  const { messages, isLoading: messagesLoading, error: messagesError, sendMessage } = useMessages(roomId);
  useEffect(() => { if (!room) return undefined; setRoomHeader(<RoomHeader room={room} isConnected={isConnected} />); return () => setRoomHeader(null); }, [room, isConnected, setRoomHeader]);
  if (roomLoading) return <Spinner label="Opening room" />;
  if (roomError) return <p className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{roomError}</p>;
  return <section className="grid h-full min-h-0 grid-rows-[1fr_auto] bg-white"><div className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><CatchUpDigest />{messagesLoading ? <Spinner label="Loading messages" /> : messagesError ? <p className="mx-4 mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700 md:mx-2">{messagesError}</p> : <MessageTimeline messages={messages} currentUserId={user.id} />}</div><MessageComposer roomName={room.name} disabled={!isConnected} onSend={sendMessage} /></section>;
}
