/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('thread_comments', {
    id: {
      type: 'VARCHAR(60)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      defaultValue: false,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('thread_comments', 'fk_thread_comments.thread_id.threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('thread_comments', 'fk_thread_comments.user_id.users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

};



exports.down = (pgm) => {
  pgm.dropTable('thread_comments');
};
