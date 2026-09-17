import IconMenu from '../assets/icons/menu.svg?react';
import IconSearch from '../assets/icons/search.svg?react';
import IconNotify from '../assets/icons/notify.svg?react';

export default function Navbar({ roomHeader = null, onMenuClick }) {
  return (
    <header className="border-b border-line bg-surface">
      <nav className="flex h-16 items-center gap-4 pl-4 pr-7">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-6 w-6 shrink-0 items-center justify-center md:hidden"
        >
          <IconMenu className="h-6 w-6 text-ink" />
        </button>

        <p className="min-w-0 flex-1 truncate text-h2 text-ink">
          {roomHeader || 'Workspace overview'}
        </p>

        <div className="flex shrink-0 items-center gap-4">
          <button type="button" aria-label="Search" className="flex h-6 w-6 items-center justify-center">
            <IconSearch className="h-6 w-6 text-ink" />
          </button>
          <button type="button" aria-label="Notifications" className="flex h-6 w-6 items-center justify-center">
            <IconNotify className="h-6 w-6 text-ink" />
          </button>
        </div>
      </nav>
    </header>
  );
}
