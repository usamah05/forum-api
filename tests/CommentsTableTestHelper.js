const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'sebuah comment',
    threadId = 'thread-123',
    owner = 'user-123',
    date = new Date().toISOString(),
    isDelete = false,
  }) {
    // Delete any existing comment with the same id to avoid duplicate key error
    await pool.query('DELETE FROM thread_comments WHERE id = $1', [id]);
    const query = {
      text: 'INSERT INTO thread_comments(id, content, thread_id, user_id, created_at, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, threadId, owner, date, isDelete],
    };
    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;