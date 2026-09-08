import { useAuth } from '../contexts/AuthContext';
import { isDevAuthBypass } from '../config/devPreview';

const metrics = [
  { previewValue: '5', label: 'unread messages', color: 'text-brand' },
  { previewValue: '2', label: 'new decisions', color: 'text-success' },
  { previewValue: '3', label: 'tasks due', color: 'text-warning' },
];

const previewActivity = [
  { id: 'activity-amina', initials: 'AM', name: 'Amina', time: '10:07 AM', message: "After testing both approaches, we'll keep Socket.IO for real-time events and REST for CRUD." },
  { id: 'activity-victor', initials: 'VI', name: 'Victor', time: '10:17 AM', message: 'Sounds good. This keeps our real-time path focused and reduces operational overhead.' },
];

function MetricCard({ metric }) {
  return <article className="h-28 rounded-xl border border-line bg-white px-5 py-4"><strong className={`text-xl font-bold ${metric.color}`}>{isDevAuthBypass ? metric.previewValue : '0'}</strong><p className="mt-2.5 text-sm text-muted">{metric.label}</p></article>;
}

function ActivityRows() {
  if (!isDevAuthBypass) return <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center"><p className="text-sm font-medium text-ink">Nothing new yet</p><p className="mt-1 text-sm text-muted">Open a room to continue the conversation.</p></div>;
  return <div className="space-y-9 md:space-y-7">{previewActivity.map((item) => <article key={item.id} className="flex items-start gap-3"><div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[#e5e7ec] text-[0px]" aria-label={item.initials} /><div className="min-w-0 flex-1"><div className="flex items-baseline gap-[58px]"><span className="text-[13px] font-medium text-ink">{item.name}</span><time className="text-xs text-muted">{item.time}</time></div><p className="mt-2 max-w-[700px] text-sm leading-[17px] text-ink md:leading-6">{item.message}</p></div></article>)}</div>;
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.display_name?.split(' ')[0] || 'there';
  return <div className="h-full min-h-0 overflow-y-auto bg-white px-4 pt-7"><div className="max-w-[1140px]"><div className="px-3"><h1 className="text-xl font-bold leading-6 tracking-[-0.01em]">Good morning, {firstName}</h1><p className="mt-2 text-sm leading-5 text-muted">Here’s what changed while you were away.</p></div><div className="mt-8 grid grid-cols-1 gap-5 md:mt-9 md:grid-cols-3 md:gap-4">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div><section className="mt-8 px-3 md:mt-14"><h2 className="text-base font-bold leading-5">Recent activity</h2><div className="mt-7 md:mt-6"><ActivityRows /></div></section></div></div>;
}
