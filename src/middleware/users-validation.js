const usersModel = require('../users/users-model');

const duplicateName = async (req, res, next) => {
  const username = req.body.username.trim();
  const users = await usersModel.findBy({ username });
  //   optional chaining (users[0]?.username)
  const possibleDuplication = users[0]?.username;
  if (possibleDuplication === username) {
    res.status(400).json({ message: 'username taken' });
  } else {
    next();
  }
};

const verifyUsernameExists = async (req, res, next) => {
  const username = req.body.username.trim();
  const [user] = await usersModel.findBy({ username });
  if (user === undefined) {
    res.status(401).json({ message: 'invalid credentials' });
  } else {
    next();
  }
};

const validBody = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(422).json({ message: 'username and password required' });
  } else {
    next();
  }
};

module.exports = {
  duplicateName,
  verifyUsernameExists,
  validBody,
};
