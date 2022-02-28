require('dotenv').config();

const server = require('./src/server');

const port = process.env.PORT;

server.listen(port, () => {
  console.log('listening on ' + port);
});
