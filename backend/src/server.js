const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const env = require('./config/env');
const { connectRedis } = require('./config/redis');
const registerSocketHandlers = require('./sockets');

async function main() {
  await connectRedis();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  registerSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`API + Socket.IO listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
