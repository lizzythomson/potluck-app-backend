const express = require('express');
const usersModel = require('./users-model');

const router = express.Router();

// A user can view all users
router.get('/', async (req, res) => {
  const users = await usersModel.findAll();
  res.json(users);
});

// A user can update their own user info
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const user_id = req.user_id;
  if (user_id !== id) {
    res.json({ message: `invalid credentials` });
  } else {
    const updatedUser = await usersModel.updateUserById(id, req.body);
    res.json(updatedUser);
  }
});

// A user can delete their account
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const user_id = req.user_id;
  if (user_id !== id) {
    res.json({ message: `invalid credentials` });
  } else {
    const result = await usersModel.deleteUser(id);
    console.log('Here', result);
    res.json(result);
  }
});

module.exports = router;
