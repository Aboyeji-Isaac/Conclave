import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import RoomList from '../rooms/RoomList';

export default function AppShell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [roomHeader, setRoomHeader] = useState(null);
  return <div className="min-h-screen bg-canvas text-ink"><div className="mx-auto flex min-h-screen w-full max-w-[1440px] overflow-hidden border-x border-line bg-white"><aside className="hidden w-shell-sidebar shrink-0 border-r border-line bg-white md:block"><RoomList /></aside><div className="flex min-w-0 flex-1 flex-col"><div className={isHome ? 'hidden md:block' : ''}><Navbar roomHeader={roomHeader} /></div><main className="min-w-0 flex-1 bg-white"><Outlet context={{ setRoomHeader }} /></main></div></div></div>;
}
