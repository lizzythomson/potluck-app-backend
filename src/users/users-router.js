const express = require('express');
const usersModel = require('./users-model');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await usersModel.findAll();
  res.json(users);
});

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
