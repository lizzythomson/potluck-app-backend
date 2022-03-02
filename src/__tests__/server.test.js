// These tests will only pass if the seed files are not changed and run
const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
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

describe('[GET] /api/events', () => {
  // test('if incorrect credentials');

  // let user_id;
  // let token;

  // beforeEach(async () => {
  //   const registerRes = await request(server)
  //     .post('/api/auth/register')
  //     .send({ username: 'test_user', password: '1234' });
  //   user_id = registerRes.body.user_id;

  //   const loginRes = await request(server)
  //     .post('/api/auth/login')
  //     .send({ username: 'abby', password: '1234' });
  //   token = loginRes.body.token;
  // });

  // afterEach(async () => {
  //   await request(server).delete(`/api/users/${user_id}`);
  // });

  test('all events are displayed that owner created', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const { user_id } = registerRes.body;

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const { token } = loginRes.body;

    const event = {
      event_name: 'Neighborhood Get Together',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'Aspen Hills Park',
      owner_id: user_id,
    };
    await eventsModel.insertEvent(event);

    const result = await request(server)
      .get('/api/events')
      .set('Authorization', token);

    expect(result.body[0]).toMatchObject(event);
  });
});

describe('[POST] /api/events', () => {
  // test('if incorrect credentials');
  test('a new event is inserted', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    await request(server)
      .post('/api/auth/login')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    await eventsModel.insertEvent({
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: 7,
    });
    const events = await db('events');
    expect(events).toHaveLength(3);
  });
});

// describe('[PUT] /api/events', () => {
//   test('if incorrect credentials');
//   test('an event is updated');
// });

// describe('[DELETE] /api/events', () => {
//   test('if incorrect credentials');
//   test('an event is deleted');
// });

// describe('[GET] /api/invitations/:event_id', () => {
//   test('if incorrect credentials');
//   test('an array of invitations for an event');
// });

// describe('[POST] /api/invitations', () => {
//   test('if incorrect credentials');
//   test('an invitation is created');
// });

// describe('[PUT] /api/invitations', () => {
//   test('if incorrect credentials');
//   test('an invitation is updated');
// });

// describe('[DELETE] /api/invitations', () => {
//   test('if incorrect credentials');
//   test('an invitation is deleted');
// });

// describe('[GET] /api/items/:event_id', () => {
//   test('if incorrect credentials');
//   test('an array of items for an event is displayed');
// });

// describe('[POST] /api/items', () => {
//   test('if incorrect credentials');
//   test('an item is created');
// });

// describe('[PUT] /api/items', () => {
//   test('if incorrect credentials');
//   test('an item is updated');
// });

// describe('[DELETE] /api/items', () => {
//   test('if incorrect credentials');
//   test('an item is deleted');
// });

// describe('[???] /api/logout', () => {
//   test('if incorrect credentials');
//   test('logout successfully');
// });
