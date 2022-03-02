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
