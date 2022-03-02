// These tests will only pass if the seed files are not changed and run
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

it('sanity check', () => {
  expect(true).not.toBe(false);
});

describe('server.js', () => {
  it('is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing');
  });
});

describe('[POST] /api/auth/register', () => {
  test('responds with correct message on empty body', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('responds with correct message on empty username', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '12345' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('responds with correct message on empty password', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sammy', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('responds with the correct message on valid credentials', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sara', password: '1234' });
    expect(result.body).toHaveProperty('username', 'sara');
  });
});
describe('[POST] /api/auth/login', () => {
  test('responds with correct message on valid credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'cammie', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'cammie', password: '1234' });
    expect(result.body.message).toMatch(/welcome, cammie/i);
  });
  test('responds with correct message on invalid password', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'jenny', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'jenny', password: '8765' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
  test('responds with correct message on invalid username', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'ally', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'allison', password: '1234' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
});
