const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index');
const bcrypt = require('bcryptjs');
const usersModel = require('./users-model');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await usersModel.findAll();
  res.json(users);
});

module.exports = router;
