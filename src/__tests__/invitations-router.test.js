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
