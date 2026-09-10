import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useRooms from '../../hooks/useRooms';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import IconHome from '@/assets/icons/home.svg?react';
import IconNotify from '@/assets/icons/notify.svg?react';
import IconMessage from '@/assets/icons/message.svg?react';
import IconThread from '@/assets/icons/thread.svg?react';
import IconMember from '@/assets/icons/member.svg?react';

// 44px row pitch = 36px pill (h-9) + 8px gap-2 on the parent nav.
// Active pill is 196 wide: 220 sidebar - 12 (mx-3) each side.
const rowClass = ({ isActive }) =>
  `mx-3 flex h-9 items-center gap-3 rounded-lg pl-3 text-body transition-colors ${
    isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-canvas'
  }`;

export default function RoomList({ onNavigate }) {
  const { rooms, isLoading, error } = useRooms();
  const { user } = useAuth();
  const displayName = user?.display_name || 'Unknown user';

  return (
    <div className="flex h-full min-h-0 flex-col pb-4 pt-6">
      <NavLink to="/" onClick={onNavigate} className="px-6 text-h2 text-brand">
        CONCLAVE
      </NavLink>

      <p className="mt-10 px-6 text-label uppercase text-muted">Workspace</p>
      <nav className="mt-18 flex flex-col gap-2">
        <NavLink end to="/" onClick={onNavigate} className={rowClass}>
          <IconHome className="h-5 w-5 shrink-0" />
          Home
        </NavLink>
        <NavLink to="/notifications" onClick={onNavigate} className={rowClass}>
          <IconNotify className="h-5 w-5 shrink-0" />
          Notifications
        </NavLink>
        {/* /dms has no route yet — falls through to the "*" redirect in App.jsx. */}
        <NavLink to="/dms" onClick={onNavigate} className={rowClass}>
          <IconMessage className="h-5 w-5 shrink-0" />
          Direct messages
        </NavLink>
      </nav>

      <p className="mt-12 px-6 text-label uppercase text-muted">Rooms</p>
      <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {isLoading && <Spinner label="Loading rooms" />}
        {error && <p className="mx-3 text-metadata text-error">{error}</p>}
        {!isLoading && !error && rooms.length === 0 && (
          <EmptyState title="No rooms yet" description="Rooms you join will appear here." />
        )}
        {rooms.map((room) => (
          <NavLink key={room.id} to={`/rooms/${room.id}`} onClick={onNavigate} className={rowClass}>
            <IconThread className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">{room.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4">
        <div className="mx-3 border-t border-line" />
        <NavLink to="/profile" onClick={onNavigate} className="mt-5 flex items-start gap-3 px-6">
          <span className="h-10 w-10 shrink-0 rounded-full bg-line" aria-hidden="true" />
          <span className="flex flex-col gap-1 pt-1">
            <span className="text-label text-ink">{displayName}</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
              <span className="text-metadata text-muted">Available</span>
            </span>
          </span>
        </NavLink>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className="mx-3 mt-4 flex h-9 items-center gap-3 rounded-lg pl-3 text-body text-ink transition-colors hover:bg-canvas"
        >
          <IconMember className="h-5 w-5 shrink-0" />
          Invite members
        </NavLink>
      </div>
    </div>
  );
}
