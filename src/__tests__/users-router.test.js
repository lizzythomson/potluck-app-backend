const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

describe('[GET] /api/users', () => {
  test('if incorrect user is not login', async () => {
    const result = await request(server).get('/api/users');
    expect(result.body.message).toMatch(/token required/i);
  });
  test('all users are displayed', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const result = await request(server)
      .get('/api/users')
      .set('Authorization', token);
    expect(result.body).toHaveLength(7);
  });
});

describe('[PUT] /api/users', () => {
  test('if incorrect credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const user2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sara', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const result = await request(server)
      .put(`/api/users/${user2.body.user_id}`)
      .send({ username: 'abigal' })
      .set('Authorization', token);
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
  test('updates user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const result = await request(server)
      .put(`/api/users/${res.body.user_id}`)
      .send({ username: 'abigal' })
      .set('Authorization', token);
    expect(result.body[0]).toHaveProperty('username', 'abigal');
  });
});

describe('[DELETE] /api/users', () => {
  test('if incorrect credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const user2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sara', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const result = await request(server)
      .delete(`/api/users/${user2.body.user_id}`)
      .set('Authorization', token);
    console.log(result.body.message);
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
  test('deletes user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const result = await request(server)
      .delete(`/api/users/${res.body.user_id}`)
      .set('Authorization', token);
    console.log('Jello', result.body[0]);
    expect(result.body[0]).toHaveProperty('username', 'abby');
  });
});
