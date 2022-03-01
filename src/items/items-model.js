const db = require('../data/db-config');

function findAll() {
  return db('items');
}

function findById(id) {
  return db('items').where('item_id', id);
}

function findBy(filter) {
  return db('items').where(filter);
}

async function insertItem(item) {
  const [newItemObject] = await db('items').insert(item, [
    'item_id',
    'item_name',
    'event_id',
    'user_id',
  ]);
  return newItemObject;
}

async function updateItemById(id, changes) {
  await db('items').update(changes).where('item_id', id);
  return findById(id);
}

async function deleteItem(id) {
  const result = await findById(id);
  await db('items').where('item_id', id).del();
  return result;
}

module.exports = {
  findAll,
  findBy,
  findById,
  insertItem,
  updateItemById,
  deleteItem,
};
