exports.up = async (knex) => {
  await knex.schema
    .createTable('users', (users) => {
      users.increments('user_id');
      users.string('username', 200).notNullable();
      users.string('password', 200).notNullable();
      users.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('events', (events) => {
      events.increments('event_id');
      events.string('event_name', 200).notNullable();
      events.datetime('date_time').notNullable();
      events.string('location').notNullable();
      events
        .integer('owner_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users');
      events.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('items', (items) => {
      items.increments('item_id');
      items.string('name', 200).notNullable();
      items
        .integer('event_id')
        .unsigned()
        .notNullable()
        .references('event_id')
        .inTable('events');
      items
        .integer('user_id')
        .unsigned()
        .references('user_id')
        .inTable('users');
      items.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('invitations', (invitations) => {
      invitations
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users');
      invitations
        .integer('event_id')
        .unsigned()
        .notNullable()
        .references('event_id')
        .inTable('events');
      invitations
        .enu('status', ['INVITED', 'ACCEPTED', 'MAYBE', 'DECLINED'])
        .defaultTo('INVITED');
      invitations.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('invitations')
    .dropTableIfExists('items')
    .dropTableIfExists('events')
    .dropTableIfExists('users');
};
