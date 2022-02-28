exports.seed = function (knex) {
  return knex('items').insert([
    {
      name: 'Dessert',
      event_id: 1,
    },
    {
      name: 'Dessert',
      event_id: 1,
      user_id: 3,
    },
    {
      name: 'Salad',
      event_id: 1,
      user_id: 3,
    },
    {
      name: 'Casserole',
      event_id: 1,
    },
    {
      name: 'Dessert',
      event_id: 2,
    },
    {
      name: 'Salad',
      event_id: 2,
    },
  ]);
};
