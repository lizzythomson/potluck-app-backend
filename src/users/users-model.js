const db = require('../data/db-config');

function findAll() {
  return db('users');
}

function findById(id) {
  return db('users').where('user_id', id);
}

function findBy(filter) {
  return db('users').where(filter);
}

async function insertUser(user) {
  // WITH POSTGRES WE CAN PASS A "RETURNING ARRAY" AS 2ND ARGUMENT TO knex.insert/update
  // AND OBTAIN WHATEVER COLUMNS WE NEED FROM THE NEWLY CREATED/UPDATED RECORD
  const [newUserObject] = await db('users').insert(user, [
    'user_id',
    'username',
    'password',
  ]);
  return newUserObject; // { user_id: 7, username: 'foo', password: 'xxxxxxx' }
}

async function updateUserById(id, changes) {
  await db('users').update(changes).where('user_id', id);
  return findById(id);
}

async function deleteUser(id) {
  const result = await findById(id);
  await db('users').where('user_id', id).del();
  return result;
}

module.exports = {
  findAll,
  findBy,
  findById,
  insertUser,
  updateUserById,
  deleteUser,
};
