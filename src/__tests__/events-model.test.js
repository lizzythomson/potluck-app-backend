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

test('the table is empty except for seed data', async () => {
  const events = await db('events');
  expect(events).toHaveLength(2);
});

test('multiple events get inserted', async () => {
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

test('can get by id', async () => {
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

test('can update event name', async () => {
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

test('can update date and time', async () => {
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

test('can update location', async () => {
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

test('can delete event', async () => {
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
