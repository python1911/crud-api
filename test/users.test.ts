import request from 'supertest';
import { createServer } from '../src/app';

const server = createServer();

describe('Users API', () => {
  let createdUserId: string;

  it('should return empty array on GET /api/users', async () => {
    const res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should create and retrieve a user', async () => {
    const user = {
      username: 'Test',
      age: 28,
      hobbies: ['coding']
    };

    const postRes = await request(server).post('/api/users').send(user);
    expect(postRes.status).toBe(201);
    expect(postRes.body).toMatchObject(user);

    createdUserId = postRes.body.id;

    const getRes = await request(server).get(`/api/users/${createdUserId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject(user);
  });

  it('should update the user with PUT /api/users/:id', async () => {
    const updatedUser = {
      username: 'Updated',
      age: 35,
      hobbies: ['books', 'gym']
    };

    const putRes = await request(server).put(`/api/users/${createdUserId}`).send(updatedUser);
    expect(putRes.status).toBe(200);
    expect(putRes.body).toMatchObject(updatedUser);
    expect(putRes.body.id).toBe(createdUserId); // ID must remain the same

    const getRes = await request(server).get(`/api/users/${createdUserId}`);
    expect(getRes.body).toMatchObject(updatedUser);
  });
});
