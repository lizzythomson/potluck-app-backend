const request = require('supertest');
const server = require('../server');
const db = require('../data/db-config');
const itemsModel = require('../items/items-model');
const invitationsModel = require('../invitations/invitations-model');

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

describe('[POST] item endpoint', () => {
  test('new item is created for an event', async () => {
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ username: 'abby', password: '1234' });
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'abby', password: '1234' });
    const token = response.body.token;
    const { user_id } = registerRes.body;

    await request(server)
      .post('/api/auth/register')
      .send({ username: 'melissa', password: '1234' });

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
      .post(`/api/items`)
      .send({ item_name: 'Potato Salad', event_id: eventId })
      .set('Authorization', token);

    expect(result.body).toMatchObject({
      item_name: 'Potato Salad',
      event_id: 3,
      user_id: null,
    });
  });
});

describe('[GET] item endpoint', () => {
  test('invitee/user gets all their items', async () => {
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

    await itemsModel.insertItem({
      item_name: 'Green Salad',
      user_id: user_id,
      event_id: eventId,
    });

    await itemsModel.insertItem({
      item_name: 'Potato Salad',
      event_id: eventId,
      user_id: user_id,
    });

    await itemsModel.insertItem({
      item_name: 'Jello Salad',
      event_id: eventId,
      user_id: user_id,
    });

    const result = await request(server)
      .get(`/api/items/`)
      .set('Authorization', token);
    expect(result.body.length).toBe(3);
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

describe('[PUT] item endpoint', () => {
  test('invitee updates item', async () => {
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
      .send({ username: 'sally', password: '1234' });
    const user_id2 = registerRes2.body.user_id;

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

    const itemRes = await itemsModel.insertItem({
      item_name: 'Green Salad',
      event_id: eventId,
    });

    await invitationsModel.insertInvitation({
      event_id: eventId,
      user_id: user_id2,
      status: 'ACCEPTED',
    });

    const response2 = await request(server)
      .post('/api/auth/login')
      .send({ username: 'sally', password: '1234' });
    const token2 = response2.body.token;

    const updatedItem = await request(server)
      .put(`/api/items/${itemRes.item_id}`)
      .send({ user_id: user_id2 })
      .set('Authorization', token2);

    expect(updatedItem.body[0]).toMatchObject({
      event_id: 3,
      item_id: 7,
      item_name: 'Green Salad',
      user_id: 8,
    });
  });
});

describe('[DELETE] item endpoint', () => {
  test('event owner deletes an item', async () => {
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

    const itemRes = await itemsModel.insertItem({
      item_name: 'Green Goddess Salad',
      event_id: eventId,
    });
    const { item_id } = itemRes;

    const result = await itemsModel.findBy({
      item_name: 'Green Goddess Salad',
    });
    expect(result[0]).toHaveProperty('item_name', 'Green Goddess Salad');

    const deletedItem = await request(server)
      .delete(`/api/items/${item_id}`)
      .set('Authorization', token);

    expect(deletedItem.body[0]).toMatchObject({
      item_id: 7,
      item_name: 'Green Goddess Salad',
      event_id: 3,
      user_id: null,
    });
  });
});
