const db = require('../data/db-config');
const usersModel = require('../users/users-model');
const eventsModel = require('../events/events-model.js');
const invitationsModel = require('../invitations/invitations-model.js');

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
  const invitations = await db('invitations');
  expect(invitations).toHaveLength(8);
});

test('multiple invitations get inserted with status blank', async () => {
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

test('multiple invitations get inserted with status blank', async () => {
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

test('can get by id', async () => {
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

test('can update invitation from invited to accepted', async () => {
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

test('can delete invitation', async () => {
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
