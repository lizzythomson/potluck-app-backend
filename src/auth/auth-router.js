const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index');
const bcrypt = require('bcryptjs');
const usersModel = require('../users/users-model');
const {
  duplicateName,
  validBody,
  verifyUsernameExists,
} = require('../middleware/users-validation');

const router = express.Router();

router.post('/register', validBody, duplicateName, async (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 4);
  const user = { username, password: hash };
  const createdUser = await usersModel.insertUser(user);
  res.status(201).json(createdUser);
});

router.post('/login', validBody, verifyUsernameExists, async (req, res) => {
  const { username, password } = req.body;
  const [user] = await usersModel.findBy({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = generateToken(user);
    res.status(200).json({ message: `welcome, ${username}`, token });
  } else {
    res.status(401).json({ message: 'invalid credentials' });
  }
});

function generateToken(user) {
  const payload = {
    user_id: user.user_id,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

module.exports = router;
