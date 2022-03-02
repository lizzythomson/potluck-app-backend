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
