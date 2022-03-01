// These tests will only pass if the seed files are not changed and run
const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const usersModel = require('../users/users-model');
const eventsModel = require('../events/events-model.js');
const invitationsModel = require('../invitations/invitations-model.js');
const itemsModel = require('../items/items-model');

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

describe('test the invitationsModel', () => {
  test('[14] the table is empty except for seed data', async () => {
    const invitations = await db('invitations');
    expect(invitations).toHaveLength(8);
  });
  test('[15] multiple invitations get inserted with status blank', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'angieWard',
      password: '12345',
    });
    const inviteeTwo = await usersModel.insertUser({
      username: 'danielleSpruse',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: user_id,
    });
    await invitationsModel.insertInvitation({
      user_id: inviteeOne.user_id,
      event_id: event_id,
    });

    await invitationsModel.insertInvitation({
      user_id: inviteeTwo.user_id,
      event_id: event_id,
    });

    const numOfInvitations = await db('invitations');
    expect(numOfInvitations).toHaveLength(10);
  });
  test('[16] multiple invitations get inserted with status blank', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'angieWard',
      password: '12345',
    });
    const inviteeTwo = await usersModel.insertUser({
      username: 'danielleSpruse',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: user_id,
    });
    const invitationOne = await invitationsModel.insertInvitation({
      user_id: inviteeOne.user_id,
      event_id: event_id,
      status: 'DECLINED',
    });

    const invitationTwo = await invitationsModel.insertInvitation({
      user_id: inviteeTwo.user_id,
      event_id: event_id,
      status: 'MAYBE',
    });

    const actualOne = await invitationsModel.findById(
      invitationOne.invitation_id
    );
    expect(actualOne[0]).toHaveProperty('status', 'DECLINED');

    const actualTwo = await invitationsModel.findById(
      invitationTwo.invitation_id
    );
    expect(actualTwo[0]).toHaveProperty('status', 'MAYBE');
  });
  test('[17] can get by id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'danielleSpruse',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: user_id,
    });
    const { invitation_id } = await invitationsModel.insertInvitation({
      user_id: inviteeOne.user_id,
      event_id: event_id,
    });

    const result = await invitationsModel.findById(invitation_id);
    expect(result[0]).toHaveProperty('status', 'INVITED');
  });
  test('[18] can update invitation from invited to accepted', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'danielleSpruse',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: user_id,
    });
    const { invitation_id } = await invitationsModel.insertInvitation({
      user_id: inviteeOne.user_id,
      event_id: event_id,
    });

    const result = await invitationsModel.findById(invitation_id);
    expect(result[0]).toHaveProperty('status', 'INVITED');

    await invitationsModel.updateInvitation(invitation_id, {
      status: 'ACCEPTED',
    });
    const actual = await invitationsModel.findById(invitation_id);
    expect(actual[0]).toHaveProperty('status', 'ACCEPTED');
  });
  test('[19] can delete invitation', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'saraWilson',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'angieWard',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'A Get Together',
      date_time: new Date('August 1, 2022 15:30').toISOString(),
      location: `City Center Park`,
      owner_id: user_id,
    });
    const invitationOne = await invitationsModel.insertInvitation({
      user_id: inviteeOne.user_id,
      event_id: event_id,
    });

    const numOfInvitations = await db('invitations');
    expect(numOfInvitations).toHaveLength(9);

    await invitationsModel.deleteInvitation(invitationOne.invitation_id);
    const endingInvitations = await db('invitations');
    expect(endingInvitations).toHaveLength(8);
  });
});

describe('test the itemsModel', () => {
  test('[20] the table is empty except for seed data', async () => {
    const items = await db('items');
    expect(items).toHaveLength(6);
  });
  test('[21] multiple items get inserted', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });
    const inviteeOne = await usersModel.insertUser({
      username: 'hannahSmith',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    await itemsModel.insertItem({
      item_name: 'Green Salad',
      user_id: inviteeOne.user_id,
      event_id: event_id,
    });

    const items = await db('items');
    expect(items).toHaveLength(7);

    await itemsModel.insertItem({
      item_name: 'Potato Salad',
      event_id: event_id,
      user_id: inviteeOne.user_id,
    });

    await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
      user_id: inviteeOne.user_id,
    });

    const endingItems = await db('items');
    expect(endingItems).toHaveLength(9);
    expect(endingItems[8]).toHaveProperty('item_name', 'Jello Salad');
    expect(endingItems[8]).toHaveProperty('user_id', inviteeOne.user_id);
  });
  test('[22] insert an item without a user_id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
    });

    const endingItems = await db('items');
    expect(endingItems).toHaveLength(7);
    expect(endingItems[6]).toHaveProperty('item_name', 'Jello Salad');
    expect(endingItems[6]).toHaveProperty('user_id', null);
  });
  test('[23] can get item by id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    const { item_id } = await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
    });

    const result = await itemsModel.findById(item_id);
    expect(result[0]).toHaveProperty('item_name', 'Jello Salad');
  });
  test('[24] can update item name', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    const { item_id } = await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
    });

    const result = await itemsModel.findById(item_id);
    expect(result[0]).toHaveProperty('item_name', 'Jello Salad');

    await itemsModel.updateItemById(item_id, {
      item_name: 'Fruit Salad',
    });

    const actual = await itemsModel.findById(item_id);
    expect(actual[0]).toHaveProperty('item_name', 'Fruit Salad');
  });
  test('[25] can update item to have user_id', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });

    const inviteeOne = await usersModel.insertUser({
      username: 'hannahSmith',
      password: '12345',
    });

    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    const { item_id } = await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
    });

    const result = await itemsModel.findById(item_id);
    expect(result[0]).toHaveProperty('user_id', null);

    await itemsModel.updateItemById(item_id, {
      user_id: inviteeOne.user_id,
    });

    const actual = await itemsModel.findById(item_id);
    expect(actual[0]).toHaveProperty('user_id', 8);
  });
  test('[26] can delete user', async () => {
    const { user_id } = await usersModel.insertUser({
      username: 'joyceSmith',
      password: '12345',
    });
    const { event_id } = await eventsModel.insertEvent({
      event_name: 'Family Potluck',
      date_time: new Date('March 31, 2023 15:30').toISOString(),
      location: `Oak Meadow Park`,
      owner_id: user_id,
    });

    const { item_id } = await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: event_id,
    });

    const result = await itemsModel.findById(item_id);
    expect(result[0]).toHaveProperty('item_name', 'Jello Salad');
    const items = await db('items');
    expect(items).toHaveLength(7);

    await itemsModel.deleteItem(result[0].item_id);
    const endingItems = await db('items');
    expect(endingItems).toHaveLength(6);
    expect(endingItems).not.toHaveProperty('item_name', 'Jello Salad');
  });
});

describe('[POST] /api/auth/register', () => {
  test('[27] responds with correct message on empty body', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[28] responds with correct message on empty username', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: '12345' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[29] responds with correct message on empty password', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sammy', password: '' });
    expect(result.body.message).toMatch(/username and password required/i);
  });
  test('[30] responds with the correct message on valid credentials', async () => {
    const result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'sara', password: '1234' });
    expect(result.body).toHaveProperty('username', 'sara');
  });
});
describe('[POST] /api/auth/login', () => {
  test('[31] responds with correct message on valid credentials', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'cammie', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'cammie', password: '1234' });
    expect(result.body.message).toMatch(/welcome, cammie/i);
  });
  test('[32] responds with correct message on invalid password', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'jenny', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'jenny', password: '8765' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
  test('[33] responds with correct message on invalid username', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'ally', password: '1234' });
    const result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'allison', password: '1234' });
    expect(result.body.message).toMatch(/invalid credentials/i);
  });
});

describe('[GET] /api/users', () => {
  test('[34] if incorrect user is not login', async () => {
    const result = await request(server).get('/api/users');
    expect(result.body.message).toMatch(/token required/i);
  });
  test('[35] all users are displayed', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const result = await request(server).get('/api/users');
    expect(result.body.message).toMatch(/oops/i);
  });
});

// describe('[POST] /api/users', () => {
//   test('[33] if incorrect credentials');
//   test('[34] returns new created user');
// });

// describe('[PUT] /api/users', () => {
//   test('[35] if incorrect credentials');
//   test('[36] updates user');
// });

// describe('[DELETE] /api/users', () => {
//   test('[37] if incorrect credentials');
//   test('[38] deletes user');
// });

// describe('[GET] /api/events/:owner_id', () => {
//   test('[39] if incorrect credentials');
//   test('[40] all events are displayed that owner created');
// });

describe('[POST] /api/events', () => {
  // test('[41] if incorrect credentials');
  test('[42] a new event is inserted', async () => {
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

// describe('[PUT] /api/events', () => {
//   test('[43] if incorrect credentials');
//   test('[44] an event is updated');
// });

// describe('[DELETE] /api/events', () => {
//   test('[45] if incorrect credentials');
//   test('[46] an event is deleted');
// });

// describe('[GET] /api/invitations/:event_id', () => {
//   test('[47] if incorrect credentials');
//   test('[48] an array of invitations for an event');
// });

// describe('[POST] /api/invitations', () => {
//   test('[49] if incorrect credentials');
//   test('[50] an invitation is created');
// });

// describe('[PUT] /api/invitations', () => {
//   test('[51] if incorrect credentials');
//   test('[52] an invitation is updated');
// });

// describe('[DELETE] /api/invitations', () => {
//   test('[53] if incorrect credentials');
//   test('[54] an invitation is deleted');
// });

// describe('[GET] /api/items/:event_id', () => {
//   test('[55] if incorrect credentials');
//   test('[56] an array of items for an event is displayed');
// });

// describe('[POST] /api/items', () => {
//   test('[57] if incorrect credentials');
//   test('[58] an item is created');
// });

// describe('[PUT] /api/items', () => {
//   test('[59] if incorrect credentials');
//   test('[60] an item is updated');
// });

// describe('[DELETE] /api/items', () => {
//   test('[61] if incorrect credentials');
//   test('[62] an item is deleted');
// });

// describe('[???] /api/logout', () => {
//   test('[63] if incorrect credentials');
//   test('[64] logout successfully');
// });
