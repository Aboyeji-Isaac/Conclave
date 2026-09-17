import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { isDevAuthBypass, previewTasks } from '../config/devPreview';

const COLUMNS = [
  { status: 'open', label: 'To do' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'done', label: 'Done' },
];

function TaskCard({ task }) {
  const isDone = task.status === 'done';
  const due = new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <article className="rounded-xl border border-line bg-surface px-18 pt-18 pb-[31px]">
      <p className={`text-label ${isDone ? 'text-success' : 'text-warning'}`}>{isDone ? 'COMPLETE' : 'ACTION ITEM'}</p>
      <p className="mt-4 text-h2 text-ink">{task.title}</p>
      <p className="mt-11 text-metadata text-muted">Assigned to {task.assignee_name} · Due {due}</p>
    </article>
  );
}

function Column({ status, label, tasks }) {
  const items = tasks.filter((task) => task.status === status);
  return (
    <section>
      <p className="text-h2 text-ink">{label} · {items.length}</p>
      {/* 42px "first card below title" is top-to-top; title's own height (20px) makes
          the real margin-top 22px. Not on the Foundations scale, kept as measured. */}
      <div className="mt-[22px] flex flex-col gap-5">
        {items.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </section>
  );
}

export default function Tasks() {
  const { setRoomHeader } = useOutletContext();
  useEffect(() => {
    setRoomHeader('Tasks');
    return () => setRoomHeader(null);
  }, [setRoomHeader]);

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface px-4 pt-6 md:pt-9">
      {isDevAuthBypass ? (
        // Mobile board stacks the three statuses as full-width sections (26px apart);
        // Tablet and Desktop both show them as a 3-column grid with 16px gaps —
        // fractional Tablet column widths in Penpot are just equal thirds, reproduced
        // here with grid instead of a hardcoded width.
        <div className="flex flex-col gap-[26px] md:grid md:grid-cols-3 md:items-start md:gap-4">
          {COLUMNS.map((column) => (
            <Column key={column.status} status={column.status} label={column.label} tasks={previewTasks} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line">
          <EmptyState title="No tasks yet" description="Tasks assigned from room messages will appear here." />
        </div>
      )}
    </div>
  );
}
