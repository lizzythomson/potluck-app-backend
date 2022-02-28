const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const usersModel = require('../users/users-model');

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

it('[0]sanity check', () => {
  expect(true).not.toBe(false);
});

describe('server.js', () => {
  it('[1]is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing');
  });
});

describe('test the usersModel', () => {
  test('[2] the table is empty except for seed data', async () => {
    const users = await db('users');
    expect(users).toHaveLength(6);
  });
  test('[2] multiple users get inserted', async () => {
    await usersModel.insertUser({
      username: 'saraWinters',
      password: '12345',
    });
    let users = await db('users');
    expect(users).toHaveLength(7);

    await usersModel.insertUser({
      username: 'annieJohnson',
      password: '7890',
    });
    users = await db('users');
    expect(users).toHaveLength(8);
  });
  test('[3] can get by id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'paulSwift',
      password: '12345',
    });
    const result = await usersModel.findById(user_id);
    expect(result[0]).toHaveProperty('username', 'paulSwift');
  });
});

describe('authentication', () => {
  describe('[POST] /api/auth/register', () => {
    test('[4] responds with correct message on empty body', async () => {
      const result = await request(server)
        .post('/api/auth/register')
        .send({ username: '', password: '' });
      expect(result.body.message).toMatch(/username and password required/i);
    });
    test('[5] responds with correct message on empty username', async () => {
      const result = await request(server)
        .post('/api/auth/register')
        .send({ username: '', password: '12345' });
      expect(result.body.message).toMatch(/username and password required/i);
    });
    test('[6] responds with correct message on empty password', async () => {
      const result = await request(server)
        .post('/api/auth/register')
        .send({ username: 'sammy', password: '' });
      expect(result.body.message).toMatch(/username and password required/i);
    });
    test('[7] responds with the correct message on valid credentials', async () => {
      const result = await request(server)
        .post('/api/auth/register')
        .send({ username: 'sara', password: '1234' });
      expect(result.body).toHaveProperty('username', 'sara');
    });
  });
  describe('[POST] /api/auth/login', () => {
    test('[8] responds with correct message on valid credentials', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'cammie', password: '1234' });
      const result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'cammie', password: '1234' });
      expect(result.body.message).toMatch(/welcome, cammie/i);
    });
    test('[9] responds with correct message on invalid password', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'jenny', password: '1234' });
      const result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'jenny', password: '8765' });
      expect(result.body.message).toMatch(/invalid credentials/i);
    });
    test('[10] responds with correct message on invalid username', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'ally', password: '1234' });
      const result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'allison', password: '1234' });
      expect(result.body.message).toMatch(/invalid credentials/i);
    });
  });
});
