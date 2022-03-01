const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const usersModel = require('../users/users-model');
const eventsModel = require('../events/events-model.js');

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
  test('[3] multiple users get inserted', async () => {
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
  test('[4] can get by id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'paulSwift',
      password: '12345',
    });
    const result = await usersModel.findById(user_id);
    expect(result[0]).toHaveProperty('username', 'paulSwift');
  });
  test('[5] can update user', async () => {
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
  test('[6] can delete user', async () => {
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
});

describe('test the eventsModel', () => {
  test('[7] the table is empty except for seed data', async () => {
    const events = await db('events');
    expect(events).toHaveLength(2);
  });
  test('[8] multiple events get inserted', async () => {
    await usersModel.insertUser({
      username: 'Snuffaluffagus',
      password: '12345',
    });
    await eventsModel.insertEvent({
      event_name: 'Seasame Street Supreme Swindig',
      date_time: new Date('April 15, 2022 15:30').toISOString(),
      location: `Grouch's TrashCan, 123 Street`,
      owner_id: 7,
    });
    let events = await db('events');
    expect(events).toHaveLength(3);

    await usersModel.insertUser({
      username: 'bluethedinosaur',
      password: '12345',
    });
    await eventsModel.insertEvent({
      event_name: 'Juarassic Park Party',
      date_time: new Date('August 15, 2022 15:30').toISOString(),
      location: `Isla Nublar`,
      owner_id: 8,
    });
    events = await db('events');
    expect(events).toHaveLength(4);
  });
  test('[9] can get by id', async () => {
    await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: 7,
    });
    const result = await eventsModel.findById(event_id);
    expect(result[0]).toHaveProperty('location', 'City Center Park');
  });
  test('[10] can update event name', async () => {
    await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: 7,
    });
    const result = await eventsModel.findById(event_id);
    expect(result[0]).toHaveProperty('event_name', 'A Get Together');
    await eventsModel.updateEventById(event_id, {
      event_name: `Misha's Baby Shower`,
    });
    const actual = await eventsModel.findById(event_id);
    expect(actual[0]).toHaveProperty('event_name', `Misha's Baby Shower`);
  });
  test('[11] can update date and time', async () => {
    await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: 7,
    });
    const result = await eventsModel.findById(event_id);
    expect(result[0].date_time.toISOString()).toBe('2022-08-01T21:30:00.000Z');
    await eventsModel.updateEventById(event_id, {
      date_time: new Date('August 3, 2022 15:30').toISOString(),
    });
    const actual = await eventsModel.findById(event_id);
    expect(actual[0].date_time.toISOString()).toBe(`2022-08-03T21:30:00.000Z`);
  });
  test('[12] can update location', async () => {
    await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: 7,
    });
    const result = await eventsModel.findById(event_id);
    expect(result[0]).toHaveProperty('location', 'City Center Park');
    await eventsModel.updateEventById(event_id, {
      location: 'Mulberry Park',
    });
    const actual = await eventsModel.findById(event_id);
    expect(actual[0]).toHaveProperty('location', `Mulberry Park`);
  });
  test('[13] can delete event', async () => {
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
});

describe('[POST] /api/auth/register', () => {
  test('[14] responds with correct message on empty body', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[15] responds with correct message on empty username', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '12345' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[16] responds with correct message on empty password', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sammy', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[17] responds with the correct message on valid credentials', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sara', password: '1234' });
    expect(result.body).toHaveProperty('username', 'sara');
  });
});
describe('[POST] /api/auth/login', () => {
  test('[18] responds with correct message on valid credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'cammie', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'cammie', password: '1234' });
    expect(result.body.message).toMatch(/welcome, cammie/i);
  });
  test('[19] responds with correct message on invalid password', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'jenny', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'jenny', password: '8765' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
  test('[20] responds with correct message on invalid username', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'ally', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'allison', password: '1234' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
});

describe('[POST] /api/events', () => {
  test('[21] a new event is inserted', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    await eventsModel.insertUser({
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: result.user_id,
    });
    const events = await db('events');
    expect(events).toHaveLength(7);
  });
});
