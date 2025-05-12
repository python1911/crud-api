import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { validate as isUuid, v4 as uuidv4 } from 'uuid';
import { getRequestBody } from '../utils/bodyParser';
import { sendMessageToMaster } from '../utils/ipc';
import { User } from '../models/user.model';

export const getUsers = async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const users = await sendMessageToMaster<User[]>('getAll');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

export const getUserById = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const { pathname } = parse(req.url || '', true);
  const id = pathname?.split('/').pop();

  if (!id || !isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const user = await sendMessageToMaster<User | undefined>('getById', id);

  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};

export const createUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const body = (await getRequestBody(req)) as Partial<User>;

    if (
      typeof body.username !== 'string' ||
      typeof body.age !== 'number' ||
      !Array.isArray(body.hobbies) ||
      !body.hobbies.every(h => typeof h === 'string')
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid request body' }));
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      username: body.username,
      age: body.age,
      hobbies: body.hobbies
    };

    const savedUser = await sendMessageToMaster<User>('create', newUser);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(savedUser));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid JSON body' }));
  }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const { pathname } = parse(req.url || '', true);
  const id = pathname?.split('/').pop();

  if (!id || !isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  try {
    const body = (await getRequestBody(req)) as Partial<User>;

    if (
      typeof body.username !== 'string' ||
      typeof body.age !== 'number' ||
      !Array.isArray(body.hobbies) ||
      !body.hobbies.every(h => typeof h === 'string')
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid request body' }));
      return;
    }

    const updatedUser = await sendMessageToMaster<User | null>('update', { id, body });

    if (!updatedUser) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedUser));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid JSON body' }));
  }
};

export const deleteUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const { pathname } = parse(req.url || '', true);
  const id = pathname?.split('/').pop();

  if (!id || !isUuid(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const success = await sendMessageToMaster<boolean>('delete', id);

  if (!success) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.writeHead(204);
  res.end();
};
