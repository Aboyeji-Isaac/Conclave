import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Room from './pages/Room';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import { connectSocket, disconnectSocket, getSocket } from './lib/socket';
import useHeartbeat from './hooks/useHeartbeat';

// TODO: wrap protected routes in an <AuthGuard> and move socket
// connection into an AuthProvider once auth state/context is wired up.
export default function App() {
  const [socket, setSocket] = useState(null);

  // Connect Socket.IO on mount if there's a stored access token.
  // In production this should live in an AuthProvider that calls
  // connectSocket() after a successful login and disconnectSocket()
  // on logout.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const s = connectSocket(token);
      setSocket(s);
    }

    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, []);

  // Keep the server's presence system alive with a heartbeat every 30s.
  // If the socket is null (not logged in), this is a no-op.
  useHeartbeat(socket);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/rooms/:roomId" element={<Room />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </div>
  );
}
