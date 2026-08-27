import { useState } from 'react';
import Button from '../ui/Button';

function ComposerIcon({ children, label }) { return <button type="button" aria-label={label} className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-canvas hover:text-ink">{children}</button>; }

export default function MessageComposer({ roomName, disabled, onSend }) {
  const [content, setContent] = useState(''); const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); const value = content.trim(); if (!value) return; try { onSend(value); setContent(''); setError(''); } catch (err) { setError(err.message); } }
  return <form onSubmit={submit} className="border-t border-line bg-white px-5 py-4"><div className="mx-auto max-w-[920px] rounded-lg border border-line bg-white p-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"><textarea value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) submit(event); }} rows="2" placeholder={`Message ${roomName}`} className="block min-h-12 w-full resize-none border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted" /><div className="mt-2 flex items-center justify-between"><div className="flex gap-2"><ComposerIcon label="Attach file">+</ComposerIcon><ComposerIcon label="Add emoji">☺</ComposerIcon></div><Button type="submit" className="min-h-9 px-5" disabled={disabled || !content.trim()}>Send</Button></div></div>{error && <p className="mx-auto mt-2 max-w-[920px] text-sm text-red-600">{error}</p>}</form>;
}
