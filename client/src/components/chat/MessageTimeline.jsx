import { useEffect, useRef } from 'react';
import EmptyState from '../ui/EmptyState';

function author(message) { return message.sender?.display_name || message.sender_name || 'Unknown member'; }

export default function MessageTimeline({ messages, currentUserId }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  if (!messages.length) return <EmptyState title="Start the conversation" description="Messages sent to this room will appear here." />;
  return <div className="flex flex-1 flex-col justify-end space-y-6 px-7 pb-5 pt-12 md:space-y-7 md:px-5 md:pb-6">{messages.map((message) => <article key={message.id} className="flex gap-3 md:gap-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e9eaee] text-[10px] font-bold text-muted md:h-10 md:w-10 md:text-xs">{author(message).slice(0, 2).toUpperCase()}</div><div className="min-w-0 pt-px"><div className="flex items-baseline gap-5"><span className="text-[13px] font-bold leading-4 text-ink">{message.sender_id === currentUserId ? 'You' : author(message)}</span><time className="text-[11px] leading-[15px] text-muted md:text-xs">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div><p className="mt-1.5 max-w-[860px] whitespace-pre-wrap break-words text-sm leading-5 text-ink md:leading-6">{message.content}</p></div></article>)}<div ref={endRef} /></div>;
}
