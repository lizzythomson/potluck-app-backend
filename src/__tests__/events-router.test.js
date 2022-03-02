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
  test('user has zero events correct message displays', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'debbie', password: '1234' });

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'debbie', password: '1234' });
    const { token } = loginRes.body;

    const result = await request(server)
      .get('/api/events')
      .set('Authorization', token);

    expect(result.body.message).toMatch(/user has not created any events/i);
  });

  describe('[POST] /api/events', () => {
    test('a new event is inserted', async () => {
      const registerRes = await request(server)
        .post('/api/auth/register')
        .send({ username: 'alphabetOrganizer', password: '1234' });
      const { user_id } = registerRes.body;

      const loginRes = await request(server)
        .post('/api/auth/login')
        .send({ username: 'alphabetOrganizer', password: '1234' });
      const { token } = loginRes.body;

      const event = {
        event_name: 'ABCs Reunion',
        date_time: new Date('April 4,, 2022 15:30').toISOString(),
        location: 'The Coconut Tree',
        owner_id: user_id,
      };

      const eventsRes = await request(server)
        .post('/api/events')
        .send(event)
        .set('Authorization', token);
      expect(eventsRes.body).toMatchObject(event);
    });
  });

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

describe('[PUT] /api/events/:event_id', () => {
  test('if incorrect credentials', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { user_id } = registerRes.body;

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { token } = loginRes.body;

    const event = {
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: user_id,
    };

    const eventRes = await request(server)
      .post('/api/events')
      .send(event)
      .set('Authorization', token);

    await request(server)
      .post('/api/auth/register')
      .send({ username: 'numberBandit', password: '1234' });

    const loginRes2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'numberBandit', password: '1234' });
    const token2 = loginRes2.body.token;

    const updateRes = await request(server)
      .put(`/api/events/${eventRes.body.event_id}`)
      .send({ event_name: 'Numbers Reunion' })
      .set('Authorization', token2);

    expect(updateRes.body.message).toBe('invalid credentials');
  });
  test('an event is updated', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { user_id } = registerRes.body;

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { token } = loginRes.body;

    const event = {
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: user_id,
    };

    const eventRes = await request(server)
      .post('/api/events')
      .send(event)
      .set('Authorization', token);

    const updateRes = await request(server)
      .put(`/api/events/${eventRes.body.event_id}`)
      .send({ event_name: 'Alphabet Reunion' })
      .set('Authorization', token);

    expect(updateRes.body[0]).toHaveProperty('event_name', 'Alphabet Reunion');
  });
});

describe('[DELETE] /api/events', () => {
  test('if incorrect credentials', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { user_id } = registerRes.body;

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { token } = loginRes.body;

    const event = {
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: user_id,
    };

    const eventRes = await request(server)
      .post('/api/events')
      .send(event)
      .set('Authorization', token);
    const event_id = eventRes.body.event_id;

    await request(server)
      .post('/api/auth/register')
      .send({ username: 'Numbersguy', password: '1234' });

    const loginRes2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Numbersguy', password: '1234' });
    const token2 = loginRes2.body.token;

    const deletedEvent = await request(server)
      .delete(`/api/events/${event_id}`)
      .set('Authorization', token2);
    expect(deletedEvent.body.message).toBe('invalid credentials');
  });

  test('an event is deleted', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { user_id } = registerRes.body;

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'alphabetOrganizer', password: '1234' });
    const { token } = loginRes.body;

    const event = {
      event_name: 'ABCs Reunion',
      date_time: new Date('April 4,, 2022 15:30').toISOString(),
      location: 'The Coconut Tree',
      owner_id: user_id,
    };

    const eventRes = await request(server)
      .post('/api/events')
      .send(event)
      .set('Authorization', token);
    const event_id = eventRes.body.event_id;

    const deletedEvent = await request(server)
      .delete(`/api/events/${event_id}`)
      .set('Authorization', token);

    expect(deletedEvent.body[0]).toHaveProperty('event_name', 'ABCs Reunion');
  });
});
