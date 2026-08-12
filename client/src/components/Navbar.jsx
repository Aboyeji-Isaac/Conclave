import { Link } from 'react-router-dom';

// TODO: show current user's avatar/name, online-status dot, notification bell
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <span className="font-semibold">Platform</span>
      <div className="flex gap-4 text-sm">
        <Link to="/">Home</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
}
