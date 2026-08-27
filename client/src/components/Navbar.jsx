import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import Button from './ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isConnected } = useRealtime();
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate('/login'); }
  return <header className="sticky top-0 z-20 border-b border-line bg-white"><nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-7"><Link to="/" className="text-[15px] font-bold tracking-[0.08em] text-brand">CONCLAVE</Link><div className="flex items-center gap-2 sm:gap-5"><span className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-line'}`} />{isConnected ? 'Live' : 'Connecting'}</span><Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink hover:bg-canvas"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{user?.display_name?.slice(0, 2).toUpperCase() || 'ME'}</span><span className="hidden sm:inline">{user?.display_name}</span></Link><Button variant="ghost" className="min-h-9 px-3" onClick={handleLogout}>Log out</Button></div></nav></header>;
}
