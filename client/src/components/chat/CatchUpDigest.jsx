import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function CatchUpDigest() {
  const navigate = useNavigate();
  return (
    // 16px margin measured on both Tablet and Desktop boards — matches base mx-4, no md: override needed.
    <aside className="mx-4 mt-18 flex h-[148px] shrink-0 flex-col rounded-xl border border-line bg-surface px-18 pt-4 md:h-32 md:flex-row md:items-start">
      <div className="min-w-0 md:flex-1">
        <p className="h-7 text-metadata uppercase text-muted">Catch-up digest</p>
        <h2 className="h-7 text-h2 text-ink">Since you were away</h2>
        <p className="text-body text-muted">New messages and room activity will appear in your digest here.</p>
      </div>
      <Button onClick={() => navigate('/digest')} className="hidden h-[42px] min-h-[42px] w-40 shrink-0 px-6 md:mt-1 md:inline-flex">Review updates</Button>
    </aside>
  );
}
