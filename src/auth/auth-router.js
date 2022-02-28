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
  try {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 4);
    const user = { username, password: hash };
    const createdUser = await usersModel.insertUser(user);
    res.status(201).json(createdUser);
  } catch {
    res.status(500).json({ message: 'server error, please try again later' });
  }
});

router.post('/login', validBody, verifyUsernameExists, (req, res) => {
  const { username, password } = req.body;
  usersModel
    .findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: `welcome, ${username}`, token });
      } else {
        res.status(401).json({ message: 'invalid credentials' });
      }
    })
    .catch(() => {
      res.status(500).json({ message: 'server error, please try again later' });
    });
});

function generateToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

module.exports = router;
