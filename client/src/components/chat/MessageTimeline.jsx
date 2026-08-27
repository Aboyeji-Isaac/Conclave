import { useEffect, useRef } from 'react';
import EmptyState from '../ui/EmptyState';

function author(message) { return message.sender?.display_name || message.sender_name || 'Unknown member'; }

export default function MessageTimeline({ messages, currentUserId }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  if (!messages.length) return <EmptyState title="Start the conversation" description="Messages sent to this room will appear here." />;
  return <div className="mx-auto max-w-[860px] space-y-8 px-6 py-8 md:px-10">{messages.map((message) => <article key={message.id} className="flex gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e9eaee] text-xs font-bold text-muted">{author(message).slice(0, 2).toUpperCase()}</div><div className="min-w-0 pt-0.5"><div className="flex items-baseline gap-5"><span className="text-[13px] font-bold text-ink">{message.sender_id === currentUserId ? 'You' : author(message)}</span><time className="text-xs text-muted">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div><p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{message.content}</p></div></article>)}<div ref={endRef} /></div>;
}
