/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async addThread({
    id = 'thread-123',
    title = 'Dicoding',
    body = 'Dicoding Indonesia',
    userId = 'user-123',
    owner = userId,
    date = new Date().toISOString(),
  }) {
    // Delete any existing thread with the same id to avoid duplicate key error
    await pool.query('DELETE FROM threads WHERE id = $1', [id]);
    const query = {
      text: 'INSERT INTO threads (id, title, body, user_id, created_at) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };
    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1 = 1');
  },
};

module.exports = ThreadTableTestHelper;
