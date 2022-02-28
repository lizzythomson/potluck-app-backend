const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const usersModel = '../users/users-model';

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
    await usersModel.insert({
      username: 'saraWinters',
      password: '12345',
    });
    let books = await db('users');
    expect(books).toHaveLength(1);

    await usersModel.insert({
      username: 'annieJohnson',
      password: '7890',
    });
    books = await db('users');
    expect(books).toHaveLength(2);
  });
  test('[3] can get by id', async () => {
    const { id } = await usersModel.insert({
      username: 'paulSwift',
      password: '12345',
    });
    const result = await usersModel.findById(id);
    expect(result).toHaveProperty('username', 'paulSwift');
  });
});
