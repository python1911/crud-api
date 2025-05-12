// src/server.ts
import http from 'http';
import dotenv from 'dotenv';
import { requestListener } from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(requestListener);

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
