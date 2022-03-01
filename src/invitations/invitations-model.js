const db = require('../data/db-config');

function findAll() {
  return db('invitations');
}

function findById(id) {
  return db('invitations').where('invitation_id', id);
}

function findBy(filter) {
  return db('invitations').where(filter);
}

async function insertInvitation(invitation) {
  const [newInvitationObject] = await db('invitations').insert(invitation, [
    'invitation_id',
    'status',
    'event_id',
    'user_id',
  ]);
  return newInvitationObject;
}

async function updateInvitation(id, changes) {
  await db('invitations').update(changes).where('invitation_id', id);
  return findById(id);
}

async function deleteInvitation(id) {
  const result = await findById(id);
  await db('invitations').where('invitation_id', id).del();
  return result;
}

module.exports = {
  findAll,
  findBy,
  findById,
  insertInvitation,
  updateInvitation,
  deleteInvitation,
};
