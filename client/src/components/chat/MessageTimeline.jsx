import { useEffect, useRef } from 'react';
import EmptyState from '../ui/EmptyState';
import Message from './Message';

function author(message) { return message.sender?.display_name || message.sender_name || 'Unknown member'; }

export function deriveMessageVariant(message) {
  if (message.attachments?.length) return 'file-attachment';
  if (message.reply_to_id) return 'thread-reply';
  if (/(^|\s)@\w+/.test(message.content || '')) return 'mention';
  return 'default';
}

export default function MessageTimeline({ messages, currentUserId }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  if (!messages.length) return <EmptyState title="Start the conversation" description="Messages sent to this room will appear here." />;
  return (
    <div className="flex flex-1 flex-col justify-end space-y-6 px-7 pb-5 pt-12 md:space-y-7 md:px-5 md:pb-6">
      {messages.map((message) => (
        <Message
          key={message.id}
          variant={deriveMessageVariant(message)}
          author={message.sender_id === currentUserId ? 'You' : author(message)}
          timestamp={new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          content={message.content}
          attachmentName={message.attachments?.[0]?.filename}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
