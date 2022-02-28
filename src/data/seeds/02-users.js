exports.seed = function (knex) {
  return knex('users').insert([
    { username: 'sammySosa', password: '12345' },
    { username: 'hankAaron', password: '12345' },
    { username: 'willieMays', password: '12345' },
    { username: 'barryBonds', password: '12345' },
    { username: 'jackieRobinson', password: '12345' },
    { username: 'busterPosey', password: '12345' },
  ]);
};
