const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads (id, title, body, user_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, user_id',
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedThread({
      id: result.rows[0].id,
      title: result.rows[0].title,
      owner: result.rows[0].user_id,
    });
  }

  async verifyThreadExists(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('GET_THREAD.NO_THREAD_FOUND');
    }
  }

  async getDetailThread(threadId) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.created_at AS date, users.username FROM threads LEFT JOIN users ON threads.user_id = users.id WHERE threads.id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('GET_THREAD.NO_THREAD_FOUND');
    }

    return {
      id: result.rows[0].id,
      title: result.rows[0].title,
      body: result.rows[0].body,
      date: typeof result.rows[0].date === 'string' ? result.rows[0].date : result.rows[0].date.toISOString(),
      username: result.rows[0].username,
    };
  }
}



module.exports = ThreadRepositoryPostgres;