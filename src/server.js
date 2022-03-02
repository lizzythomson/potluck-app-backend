const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const restrict = require('./middleware/restricted');

const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const eventsRouter = require('./events/events-router');
const invitationsRouter = require('./invitations/invitations-router');

const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());

server.use('/api/auth', authRouter);
server.use('/api/users', restrict, usersRouter);
server.use('/api/events', restrict, eventsRouter);
server.use('/api/invitations', restrict, invitationsRouter);

server.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: 'Server Error. Please Try Again Later',
  });
});

module.exports = server;
