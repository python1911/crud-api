import http, { IncomingMessage, ServerResponse } from 'http';
import { usersHandler } from './routes/users.route';

export const requestListener = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  try {
    if (req.url?.startsWith('/api/users')) {
      await usersHandler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Route not found' }));
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
};


export const createServer = () => http.createServer(requestListener);
