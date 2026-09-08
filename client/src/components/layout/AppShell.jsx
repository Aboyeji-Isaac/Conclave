import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import RoomList from '../rooms/RoomList';

export default function AppShell() {
  const [roomHeader, setRoomHeader] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="grid h-dvh min-h-0 grid-cols-1 bg-canvas text-ink md:grid-cols-[248px_1fr]">
      <aside className="hidden min-h-0 border-r border-line bg-white md:block">
        <RoomList onNavigate={() => setDrawerOpen(false)} />
      </aside>

      <div className="grid min-h-0 grid-rows-[auto_1fr]">
        <Navbar roomHeader={roomHeader} onMenuClick={() => setDrawerOpen(true)} />
        <main className="min-w-0 min-h-0 bg-white">
          <Outlet context={{ setRoomHeader }} />
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 overscroll-contain bg-ink/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[248px] overscroll-contain bg-white shadow-modal">
            <RoomList onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
