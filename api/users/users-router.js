const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index');
const bcrypt = require('bcryptjs');
const usersModel = require('./users-model');

const router = express.Router();

router.get('/', (req, res, next) => {
  usersModel
    .findAll()
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});

// async function insertUser(user) {
//     // WITH POSTGRES WE CAN PASS A "RETURNING ARRAY" AS 2ND ARGUMENT TO knex.insert/update
//     // AND OBTAIN WHATEVER COLUMNS WE NEED FROM THE NEWLY CREATED/UPDATED RECORD
//     const [newUserObject] = await db('users').insert(user, ['user_id', 'username', 'password'])
//     return newUserObject // { user_id: 7, username: 'foo', password: 'xxxxxxx' }
//   }

//   const server = express()
//   server.use(express.json())
//   server.use(helmet())
//   server.use(cors())

//   server.get('/api/users', async (req, res) => {
//     res.json(await getAllUsers())
//   })

//   server.post('/api/users', async (req, res) => {
//     res.status(201).json(await insertUser(req.body))
//   })

module.exports = router;
