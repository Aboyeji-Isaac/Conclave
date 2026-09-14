import { useAuth } from '../contexts/AuthContext';
import { isDevAuthBypass } from '../config/devPreview';
import Message from '../components/chat/Message';

const metrics = [
  { previewValue: '5', label: 'unread messages', color: 'text-brand' },
  { previewValue: '2', label: 'new decisions', color: 'text-success' },
  { previewValue: '3', label: 'tasks due', color: 'text-warning' },
];

const previewActivity = [
  { id: 'activity-amina-decision', author: 'Amina', timestamp: '10:07 AM', content: "After testing both approaches, we'll keep Socket.IO for real-time events and REST for CRUD." },
  { id: 'activity-victor', author: 'Victor', timestamp: '10:17 AM', content: 'Sounds good. This keeps our real-time path focused and reduces operational overhead.' },
  { id: 'activity-amina-mention', author: 'Amina', timestamp: '10:27 AM', content: '@Priya can you confirm deployment readiness for the API gateway changes today?', variant: 'mention' },
  { id: 'activity-priya', author: 'Priya', timestamp: '10:37 AM', content: 'On it—validating the config and will update here by EOD.' },
  { id: 'activity-daniel', author: 'Daniel', timestamp: '10:47 AM', content: 'Uploaded the latest checklist with the rollback steps and verification items.', variant: 'file-attachment', attachments: [{ id: 'preview-attachment', filename: 'deployment-checklist-v2.pdf' }] },
];

function MetricCard({ metric }) {
  return <article className="h-28 rounded-xl border border-line bg-surface px-5 pt-18"><strong className={`text-h1 ${metric.color}`}>{isDevAuthBypass ? metric.previewValue : '0'}</strong><p className="mt-2.5 text-body text-muted">{metric.label}</p></article>;
}

function ActivityRows() {
  if (!isDevAuthBypass) return <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center"><p className="text-sm font-medium text-ink">Nothing new yet</p><p className="mt-1 text-sm text-muted">Open a room to continue the conversation.</p></div>;
  // 16px/57px measured against Room View's actual Message component instances
  // (auto-height content, not a hand-drawn mockup value) — not a Foundations token.
  return <div className="space-y-4 md:space-y-[57px]">{previewActivity.map((item) => <Message key={item.id} variant={item.variant || 'default'} author={item.author} timestamp={item.timestamp} content={item.content} attachments={item.attachments} />)}</div>;
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.display_name?.split(' ')[0] || 'there';
  return <div className="h-full min-h-0 overflow-y-auto bg-surface px-4 pt-7"><div className="max-w-[1140px]"><div className="px-3"><h1 className="text-h1">Good morning, {firstName}</h1><p className="mt-2 text-body text-muted">Here’s what changed while you were away.</p></div>
    {/* md:grid-cols-3 matches the Desktop board (3-up, 18px gaps). The Tablet board
        actually shows a 2-column wrap (18px column-gap/20px row-gap) at the same
        md breakpoint — not expressible with the single md breakpoint this project uses. */}
    <div className="mt-8 grid grid-cols-1 gap-5 md:mt-9 md:grid-cols-3 md:gap-18">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div><section className="mt-8 px-3 md:mt-14"><h2 className="text-h2">Recent activity</h2><div className="mt-7 md:mt-6"><ActivityRows /></div></section></div></div>;
}
