exports.seed = function (knex) {
  return knex('items').insert([
    {
      item_name: 'Dessert',
      event_id: 1,
    },
    {
      item_name: 'Dessert',
      event_id: 1,
      user_id: 3,
    },
    {
      item_name: 'Salad',
      event_id: 1,
      user_id: 3,
    },
    {
      item_name: 'Casserole',
      event_id: 1,
    },
    {
      item_name: 'Dessert',
      event_id: 2,
    },
    {
      item_name: 'Salad',
      event_id: 2,
    },
  ]);
};
