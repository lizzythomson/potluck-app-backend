const db = require('../data/db-config');
const usersModel = require('../users/users-model');
const eventsModel = require('../events/events-model.js');
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

test('the table is empty except for seed data', async () => {
  const items = await db('items');
  expect(items).toHaveLength(6);
});

test('multiple items get inserted', async () => {
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

test('insert an item without a user_id', async () => {
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

test('can get item by id', async () => {
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

test('can update item name', async () => {
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

test('can update item to have user_id', async () => {
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

test('can delete user', async () => {
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
