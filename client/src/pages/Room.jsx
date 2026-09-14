import { useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import CatchUpDigest from '../components/chat/CatchUpDigest';
import MessageComposer from '../components/chat/MessageComposer';
import MessageTimeline from '../components/chat/MessageTimeline';
import RoomHeader from '../components/chat/RoomHeader';
import Spinner from '../components/ui/Spinner';
import { useRealtime } from '../contexts/RealtimeContext';
import useMessages from '../hooks/useMessages';
import useRoom from '../hooks/useRoom';

export default function Room() {
  const { roomId } = useParams(); const { isConnected } = useRealtime();
  const { setRoomHeader } = useOutletContext();
  const { room, isLoading: roomLoading, error: roomError } = useRoom(roomId);
  const { messages, isLoading: messagesLoading, error: messagesError, sendMessage } = useMessages(roomId);
  const scrollContainerRef = useRef(null);
  useEffect(() => { if (!room) return undefined; setRoomHeader(<RoomHeader room={room} isConnected={isConnected} />); return () => setRoomHeader(null); }, [room, isConnected, setRoomHeader]);
  if (roomLoading) return <Spinner label="Opening room" />;
  if (roomError) return <p className="m-6 rounded-lg bg-error/10 p-4 text-sm text-error">{roomError}</p>;
  return <section className="grid h-full min-h-0 grid-rows-[1fr_auto] bg-surface"><div ref={scrollContainerRef} className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><CatchUpDigest />{messagesLoading ? <Spinner label="Loading messages" /> : messagesError ? <p className="mx-4 mt-5 rounded-lg bg-error/10 p-4 text-sm text-error md:mx-2">{messagesError}</p> : <MessageTimeline messages={messages} scrollContainerRef={scrollContainerRef} />}</div><MessageComposer disabled={!isConnected} onSend={sendMessage} /></section>;
}
