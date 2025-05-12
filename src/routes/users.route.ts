import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/users.controller';

export const usersHandler = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const { url, method } = req;
  const parsedUrl = parse(url || '', true);
  const path = parsedUrl.pathname || '';

  const userIdMatch = path.match(/^\/api\/users\/([a-zA-Z0-9\-]+)$/);

  if (path === '/api/users' && method === 'GET') {
    await getUsers(req, res);
  } else if (path === '/api/users' && method === 'POST') {
    await createUser(req, res);
  } else if (userIdMatch && method === 'GET') {
    await getUserById(req, res);
  } else if (userIdMatch && method === 'PUT') {
    await updateUser(req, res);
  } else if (userIdMatch && method === 'DELETE') {
    await deleteUser(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User route not found' }));
  }
};
