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
