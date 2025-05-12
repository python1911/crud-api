import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { createServer } from './app';
import dotenv from 'dotenv';
import { User } from './models/user.model';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const CPUS = os.availableParallelism ? os.availableParallelism() - 1 : os.cpus().length - 1;

// Shared users list in master process
let users: User[] = [];

if (cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);
  console.log(`Starting ${CPUS} workers...\n`);

  // Fork workers
  for (let i = 0; i < CPUS; i++) {
    const workerPort = PORT + i + 1;
    cluster.fork({ PORT: String(workerPort) });
  }

  // Handle messages from workers
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    if (worker) {
      worker.on('message', (msg) => {
        const { action, payload, messageId } = msg;
        let result;

        switch (action) {
          case 'getAll':
            result = users;
            break;

          case 'getById':
            result = users.find((u) => u.id === payload);
            break;

          case 'create':
            users.push(payload);
            result = payload;
            break;

          case 'update':
            const index = users.findIndex((u) => u.id === payload.id);
            if (index !== -1) {
              users[index] = { id: payload.id, ...payload.body };
              result = users[index];
            } else {
              result = null;
            }
            break;

          case 'delete':
            const originalLength = users.length;
            users = users.filter((u) => u.id !== payload);
            result = users.length < originalLength;
            break;

          default:
            result = null;
        }

        worker.send({ messageId, result });
      });
    }
  }

  // Load balancer: Round-Robin proxy
  let index = 0;
  const workerPorts = Array.from({ length: CPUS }, (_, i) => PORT + i + 1);

  const loadBalancer = http.createServer((req, res) => {
    const targetPort = workerPorts[index];
    index = (index + 1) % workerPorts.length;

    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxy, { end: true });

    proxy.on('error', () => {
      res.writeHead(500);
      res.end('Internal proxy error');
    });
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer running at http://localhost:${PORT}`);
  });

} else {
  const workerPort = Number(process.env.PORT);
  const server = createServer();

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} running at http://localhost:${workerPort}`);
  });
}
