import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import RoomList from '../rooms/RoomList';

export default function AppShell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return <div className="min-h-screen bg-canvas text-ink"><div className={isHome ? 'hidden md:block' : ''}><Navbar /></div><div className={`mx-auto flex w-full max-w-[1440px] ${isHome ? 'min-h-screen md:min-h-[calc(100vh-4rem)]' : 'min-h-[calc(100vh-4rem)]'}`}><aside className="hidden w-[272px] shrink-0 border-r border-line bg-white md:block"><RoomList /></aside><main className="min-w-0 flex-1 bg-white"><Outlet /></main></div></div>;
}
