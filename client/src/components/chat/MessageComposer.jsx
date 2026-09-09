import { useState } from 'react';
import Button from '../ui/Button';

function ComposerIcon({ children, label }) { return <button type="button" aria-label={label} className="grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink">{children}</button>; }

export default function MessageComposer({ disabled, onSend }) {
  const [content, setContent] = useState(''); const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); const value = content.trim(); if (!value) return; try { onSend(value); setContent(''); setError(''); } catch (err) { setError(err.message); } }
  return <form onSubmit={submit} className="shrink-0 bg-white px-4 pb-6 pt-2 md:px-2"><div className="flex h-16 items-center gap-2 rounded-lg border border-line bg-white px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"><div className="flex shrink-0 gap-1"><ComposerIcon label="Attach file">+</ComposerIcon><ComposerIcon label="Add emoji">☺</ComposerIcon></div><textarea value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) submit(event); }} rows="1" placeholder="Message…" className="block min-h-6 min-w-0 flex-1 resize-none border-0 bg-transparent py-1 text-sm leading-5 text-ink outline-none placeholder:text-muted" /><Button type="submit" className="min-h-9 shrink-0 px-5" disabled={disabled || !content.trim()}>Send</Button></div>{error && <p className="mt-2 px-1 text-sm text-red-600">{error}</p>}</form>;
}
