import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { isDevAuthBypass, previewDigestItems, previewDigestSummary } from '../config/devPreview';

// Type-to-label/colour mapping lives here, not in the fixtures — the backend will send
// a bare `type`, not display copy, once getRoomDigest (digest.controller.js) is implemented.
const ITEM_TYPES = {
  decision: { label: 'DECISION', color: 'text-success', dot: 'bg-success' },
  task: { label: 'TASK ASSIGNED', color: 'text-warning', dot: 'bg-warning' },
  mention: { label: 'MENTION', color: 'text-brand', dot: 'bg-brand' },
  file: { label: 'FILE SHARED', color: 'text-brand', dot: 'bg-brand' },
  activity: { label: 'HIGH ACTIVITY', color: 'text-brand', dot: 'bg-brand' },
};

function DigestItem({ type, title, metadata }) {
  const { label, color, dot } = ITEM_TYPES[type];
  return (
    <article className="flex items-start gap-[14px] rounded-xl border border-line bg-surface px-4 pt-18 pb-[15px]">
      <span className={`h-7 w-7 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={`text-label ${color}`}>{label}</p>
        <p className="mt-3 text-h2 text-ink">{title}</p>
        <p className="mt-3 text-metadata text-muted">{metadata}</p>
      </div>
    </article>
  );
}

export default function CatchUpDigestPage() {
  const { setRoomHeader } = useOutletContext();
  useEffect(() => {
    setRoomHeader('Catch-up digest');
    return () => setRoomHeader(null);
  }, [setRoomHeader]);

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface px-4 pt-[22px] md:pt-7">
      {isDevAuthBypass ? (
        <>
          <div className="rounded-xl border border-line bg-surface px-18 pt-18 pb-9">
            <p className="text-label text-muted">SINCE YOU WERE AWAY</p>
            <p className="mt-3 text-h1 text-ink">{previewDigestSummary.headline}</p>
            <p className="mt-3 text-body text-muted">{previewDigestSummary.summary}</p>
          </div>
          <div className="mt-10 flex flex-col gap-5">
            {previewDigestItems.map((item) => <DigestItem key={item.id} {...item} />)}
          </div>
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-line">
          <EmptyState title="Nothing to catch up on" description="Updates since your last visit will appear here." />
        </div>
      )}
    </div>
  );
}
