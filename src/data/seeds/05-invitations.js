exports.seed = function (knex) {
  return knex('invitations').insert([
    { user_id: 4, event_id: 1, status: 'MAYBE' },
    { user_id: 5, event_id: 1, status: 'DECLINED' },
    { user_id: 6, event_id: 1, status: 'ACCEPTED' },
    { user_id: 2, event_id: 2 },
    { user_id: 3, event_id: 2 },
    { user_id: 4, event_id: 2 },
    { user_id: 5, event_id: 2 },
    { user_id: 6, event_id: 2 },
  ]);
};
