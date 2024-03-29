const db = require('../data/db-config');

function findAll() {
  return db('events');
}

function findById(id) {
  return db('events').where('event_id', id);
}

function findBy(filter) {
  return db('events').where(filter);
}

async function insertEvent(event_id) {
  const [newEvent_Object] = await db('events').insert(event_id, [
    'event_id',
    'event_name',
    'date_time',
    'location',
    'owner_id',
  ]);
  return newEvent_Object;
}

async function updateEventById(id, changes) {
  await db('events').update(changes).where('event_id', id);
  return findById(id);
}

async function deleteEvent(id) {
  const result = await findById(id);
  await db('events').where('event_id', id).del();
  return result;
}

module.exports = {
  findAll,
  findBy,
  findById,
  insertEvent,
  updateEventById,
  deleteEvent,
};
