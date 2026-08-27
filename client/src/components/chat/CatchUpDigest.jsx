import Button from '../ui/Button';

export default function CatchUpDigest() {
  return <aside className="mx-auto mt-6 flex max-w-[920px] flex-col gap-5 rounded-panel border border-line bg-white p-5 shadow-panel sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Catch-up digest</p><h2 className="mt-2 text-base font-bold text-ink">Since you were away</h2><p className="mt-1 text-sm text-muted">New messages and room activity will appear in your digest here.</p></div><Button className="shrink-0">View updates</Button></aside>;
}
