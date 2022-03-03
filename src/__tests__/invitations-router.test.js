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

describe('[POST] invitation endpoint', () => {
  test('new invitation is created for an event', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    const registerRes2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });
    const userId2 = registerRes2.body.user_id;

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
    const eventId = eventsRes.body.event_id;
    // console.log(userId2, eventId);

    const result = await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId2, event_id: eventId })
      .set('Authorization', token);

    expect(result.body).toHaveProperty('status', 'INVITED');
  });
});

describe('[GET] invitation endpoint', () => {
  test('invitee/user gets all their invitations', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });

    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    const registerRes2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });
    const userId2 = registerRes2.body.user_id;

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
    const eventId = eventsRes.body.event_id;

    await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId2, event_id: eventId })
      .set('Authorization', token);

    const response2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'melissa', password: '1234' });
    const token2 = response2.body.token;

    const result = await request(server)
      .get(`/api/invitations/`)
      .set('Authorization', token2);
    expect(result.body.length).toBe(1);
    expect(result.body[0]).toHaveProperty('status', 'INVITED');
  });

  test('event owner gets correct message when has not created any invitations', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

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
    const eventId = eventsRes.body.event_id;

    const result = await request(server)
      .get(`/api/invitations/${eventId}`)
      .set('Authorization', token);
    expect(result.body.message).toBe('user has not created any events');
  });

  test('event owner gets all the event invitations', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    const registerRes2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });
    const userId2 = registerRes2.body.user_id;

    const registerRes3 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'cameron', password: '1234' });
    const userId3 = registerRes3.body.user_id;

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
    const eventId = eventsRes.body.event_id;

    await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId2, event_id: eventId })
      .set('Authorization', token);

    await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId3, event_id: eventId })
      .set('Authorization', token);

    const result = await request(server)
      .get(`/api/invitations/${eventId}`)
      .set('Authorization', token);
    expect(result.body.length).toBe(2);
  });
});

describe('[PUT] invitation endpoint', () => {
  test('invitee updates invitation', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });

    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    const registerRes2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });
    const userId2 = registerRes2.body.user_id;

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
    const eventId = eventsRes.body.event_id;

    await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId2, event_id: eventId })
      .set('Authorization', token);

    const response2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'melissa', password: '1234' });
    const token2 = response2.body.token;

    const beforeStatusChange = await request(server)
      .get(`/api/invitations/`)
      .set('Authorization', token2);
    const invitation_id = beforeStatusChange.body[0].invitation_id;
    expect(beforeStatusChange.body.length).toBe(1);
    expect(beforeStatusChange.body[0]).toHaveProperty('status', 'INVITED');

    const afterStatusChange = await request(server)
      .put(`/api/invitations/${invitation_id}`)
      .set('Authorization', token2)
      .send({ status: 'ACCEPTED' });

    expect(afterStatusChange.body[0]).toHaveProperty('status', 'ACCEPTED');
  });
});

describe('[DELETE] invitation endpoint', () => {
  test('event owner deletes an invitation', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });

    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    const registerRes2 = await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });
    const userId2 = registerRes2.body.user_id;

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
    const eventId = eventsRes.body.event_id;

    await request(server)
      .post(`/api/invitations`)
      .send({ user_id: userId2, event_id: eventId })
      .set('Authorization', token);

    const response2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'melissa', password: '1234' });
    const token2 = response2.body.token;

    const result = await request(server)
      .get(`/api/invitations/`)
      .set('Authorization', token2);
    const invitation_id = result.body[0].invitation_id;
    expect(result.body.length).toBe(1);
    expect(result.body[0]).toHaveProperty('status', 'INVITED');

    const response3 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token3 = response3.body.token;

    const deletedInvitation = await request(server)
      .delete(`/api/invitations/${invitation_id}`)
      .set('Authorization', token3);

    expect(deletedInvitation.body[0]).toMatchObject({
      event_id: 3,
      invitation_id: 9,
      status: 'INVITED',
      user_id: 8,
    });
  });
});
