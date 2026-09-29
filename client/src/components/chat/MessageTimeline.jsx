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

const NEAR_BOTTOM_PX = 50;

export default function MessageTimeline({ messages, scrollContainerRef }) {
  const endRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return undefined;
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      isAtBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_PX;
    };
    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  useEffect(() => {
    if (isAtBottomRef.current) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastMessage?.id]);

  if (!messages.length) return <EmptyState title="Start the conversation" description="Messages sent to this room will appear here." />;
  return (
    // 28px horizontal padding measured on both Tablet and Desktop boards — matches base px-7, no md: override needed.
    <div className="flex flex-1 flex-col space-y-4 px-7 pb-5 pt-12 md:space-y-6 md:pb-6">
      {messages.map((message, index) => (
        <div key={message.id} className={index === 0 ? 'mt-auto' : undefined}>
          <Message
            variant={deriveMessageVariant(message)}
            author={author(message)}
            timestamp={new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            content={message.content}
            attachments={message.attachments}
          />
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
