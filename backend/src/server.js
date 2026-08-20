const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = require('./app');
const env = require('./config/env');
const { connectRedis, redisClient } = require('./config/redis');
const registerSocketHandlers = require('./sockets');

async function main() {
  await connectRedis();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  // Wire up the Redis adapter for multi-instance pub/sub.
  // This lets io.to(roomId).emit() reach clients connected to
  // OTHER server instances via Redis — required for horizontal scaling.
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  registerSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`API + Socket.IO listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
