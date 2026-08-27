import { NavLink } from 'react-router-dom';
import useRooms from '../../hooks/useRooms';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

export default function RoomList() {
  const { rooms, isLoading, error } = useRooms();
  return <div className="p-4 md:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Rooms</h2><span className="grid h-7 w-7 place-items-center rounded-md border border-line text-lg leading-none text-muted" aria-hidden="true">+</span></div>{isLoading && <Spinner label="Loading rooms" />}{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!isLoading && !error && rooms.length === 0 && <EmptyState title="No rooms yet" description="Rooms you join will appear here." />}<nav className="space-y-1">{rooms.map((room) => <NavLink key={room.id} to={`/rooms/${room.id}`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-canvas'}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-sm font-semibold">#</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{room.name}</span><span className="block text-xs text-muted">{room.member_count} members</span></span></NavLink>)}</nav></div>;
}
