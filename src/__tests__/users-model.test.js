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

test('the table is empty except for seed data', async () => {
  const users = await db('users');
  expect(users).toHaveLength(6);
});

test('multiple users get inserted', async () => {
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

test('can get by id', async () => {
  const { user_id } = await usersModel.insertUser({
    username: 'paulSwift',
    password: '12345',
  });
  const result = await usersModel.findById(user_id);
  expect(result[0]).toHaveProperty('username', 'paulSwift');
});

test('can update user', async () => {
  const newUser = await usersModel.insertUser({
    username: 'gessicaStone',
    password: '12345',
  });
  const result = await usersModel.findById(newUser.user_id);
  expect(result[0]).toHaveProperty('username', 'gessicaStone');
  await usersModel.updateUserById(newUser.user_id, {
    username: 'jessicaStone',
  });
  const actual = await usersModel.findById(newUser.user_id);
  expect(actual[0]).toHaveProperty('username', 'jessicaStone');
});

test('can delete user', async () => {
  const startingUsers = await db('users');
  expect(startingUsers).toHaveLength(6);
  const { user_id } = await usersModel.insertUser({
    username: 'gabbyRaines',
    password: '12345',
  });
  const users = await db('users');
  expect(users).toHaveLength(7);
  await usersModel.deleteUser(user_id);
  const endingUsers = await db('users');
  expect(endingUsers).toHaveLength(6);
  expect(endingUsers).not.toHaveProperty('username', 'gabbyRaines');
});
