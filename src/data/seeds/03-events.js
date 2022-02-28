exports.seed = function (knex) {
  return knex('events').insert([
    {
      event_name: 'San Fransico Baseball Player Reunion',
      date_time: new Date('June 27, 2022 15:30').toISOString(),
      location: 'Oracle Park, 24 Wille Mays Plaza, San Franciso, CA',
      owner_id: '3',
    },
    {
      event_name: 'Greatest Baseball Players Potluck',
      date_time: new Date('July 4, 2022 18:00').toISOString(),
      location: 'Yankee Stadium, 1 East 161st Street, The Bronx, New York',
      owner_id: '1',
    },
  ]);
};
