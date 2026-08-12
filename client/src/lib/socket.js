import { io } from 'socket.io-client';

// Call connectSocket() once after login, with the fresh access token.
// See backend/src/sockets/index.js for the full event list.
let socket;

export function connectSocket(accessToken) {
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: accessToken },
  });
  return socket;
}

export function getSocket() {
  return socket;
}
