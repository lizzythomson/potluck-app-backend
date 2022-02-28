const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index');
const bcrypt = require('bcryptjs');
const usersModel = require('../users/users-model');

const router = express.Router();

router.get('/', (req, res, next) => {
  usersModel
    .findAll()
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});

module.exports = router;
