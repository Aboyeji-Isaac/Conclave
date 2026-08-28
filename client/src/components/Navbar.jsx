import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import Button from './ui/Button';

export default function Navbar({ roomHeader = null }) {
  const { user, logout } = useAuth();
  const { isConnected } = useRealtime();
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate('/login'); }
  return <header className="sticky top-0 z-20 border-b border-line bg-white"><nav className="flex h-16 items-center justify-between gap-3 px-4 md:h-shell-topbar md:px-7">{roomHeader || <><Link to="/" className="text-[15px] font-bold tracking-[0.08em] text-brand md:hidden">CONCLAVE</Link><div className="hidden md:block"><p className="text-sm font-semibold text-ink">Conclave workspace</p></div></>}<div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3"><Link to="/notifications" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-canvas hover:text-ink sm:block">Notifications</Link><span className="hidden items-center gap-2 text-xs text-muted md:flex"><span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-line'}`} />{isConnected ? 'Live' : 'Connecting'}</span><Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas md:px-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{user?.display_name?.slice(0, 2).toUpperCase() || 'ME'}</span><span className="hidden lg:inline">{user?.display_name}</span></Link><Button variant="ghost" className="hidden min-h-9 px-3 sm:inline-flex" onClick={handleLogout}>Log out</Button></div></nav></header>;
}
