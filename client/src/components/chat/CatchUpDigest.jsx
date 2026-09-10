import Button from '../ui/Button';

export default function CatchUpDigest() {
  return (
    <aside className="mx-4 mt-18 flex h-[148px] shrink-0 items-start rounded-xl border border-line bg-surface px-18 pt-4 md:mx-2 md:h-32">
      <div className="min-w-0 flex-1">
        <p className="h-7 text-metadata uppercase text-muted">Catch-up digest</p>
        <h2 className="h-7 text-h2 text-ink">Since you were away</h2>
        <p className="text-body text-muted">New messages and room activity will appear in your digest here.</p>
      </div>
      <Button className="mt-1 h-[42px] min-h-[42px] w-40 shrink-0 px-6">Review updates</Button>
    </aside>
  );
}
