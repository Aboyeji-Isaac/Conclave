import Button from '../ui/Button';

export default function CatchUpDigest() {
  return <aside className="mx-4 mt-[18px] flex h-[148px] shrink-0 flex-col justify-between rounded-xl border border-line bg-white px-[18px] py-4 sm:flex-row sm:items-start md:mx-2 md:h-32"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase leading-[15px] tracking-[0.05em] text-muted">Catch-up digest</p><h2 className="mt-[13px] text-base font-bold leading-5 text-ink">Since you were away</h2><p className="mt-2 truncate text-sm leading-6 text-muted">New messages and room activity will appear in your digest here.</p></div><Button className="h-[42px] min-h-[42px] shrink-0 self-end px-6 sm:mt-1 sm:w-[170px] sm:self-start">Review updates</Button></aside>;
}
