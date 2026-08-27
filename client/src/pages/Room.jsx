import { useParams } from 'react-router-dom';
import CatchUpDigest from '../components/chat/CatchUpDigest';
import MessageComposer from '../components/chat/MessageComposer';
import MessageTimeline from '../components/chat/MessageTimeline';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import useMessages from '../hooks/useMessages';
import useRoom from '../hooks/useRoom';

export default function Room() {
  const { roomId } = useParams(); const { user } = useAuth(); const { isConnected } = useRealtime();
  const { room, isLoading: roomLoading, error: roomError } = useRoom(roomId);
  const { messages, isLoading: messagesLoading, error: messagesError, sendMessage } = useMessages(roomId);
  if (roomLoading) return <Spinner label="Opening room" />;
  if (roomError) return <p className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{roomError}</p>;
  return <section className="flex h-[calc(100vh-4rem)] flex-col bg-white"><header className="border-b border-line px-5 py-4 md:px-8"><div className="mx-auto flex max-w-[920px] items-center justify-between"><div><h1 className="text-base font-bold text-ink">{room.name}</h1><p className="mt-1 text-xs text-muted">{room.members?.length || 0} members</p></div><span className="rounded-full border border-line px-3 py-1 text-xs text-muted">{isConnected ? 'Live' : 'Reconnecting'}</span></div></header><div className="min-h-0 flex-1 overflow-y-auto px-5"><CatchUpDigest />{messagesLoading ? <Spinner label="Loading messages" /> : messagesError ? <p className="mx-auto mt-5 max-w-[920px] rounded-lg bg-red-50 p-4 text-sm text-red-700">{messagesError}</p> : <MessageTimeline messages={messages} currentUserId={user.id} />}</div><MessageComposer roomName={room.name} disabled={!isConnected} onSend={sendMessage} /></section>;
}
