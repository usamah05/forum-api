const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');


describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });

    it('should added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });

      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('sebuah thread');
      expect(addedThread.owner).toEqual('user-123');
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw Error when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .rejects
        .toThrowError('GET_THREAD.NO_THREAD_FOUND');
    });

    it('should not throw Error when thread is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves
        .not.toThrow();
    });
  });

  it('should throw Error whith correct message when thread not found', async () => {
    // Arrange
    const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

    // Action & Assert
    await expect(threadRepositoryPostgres.getThreadById('thread-xxx'))
      .rejects.toThrowError('GET_THREAD.NO_THREAD_FOUND');
  });

  it('should return thread detail correctly when thread is found', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
    await ThreadTableTestHelper.addThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2025-12-01T00:00:00.000Z',
      owner: 'user-123',
    });
    const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
    // Action
    const thread = await threadRepositoryPostgres.getThreadById('thread-123');
    // Assert
    expect(thread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2025-11-30T17:00:00.000Z',
      username: 'masboy',
    });
  });

  describe('getThreadById function', () => {
    it('should throw Error when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError('GET_THREAD.NO_THREAD_FOUND');
    });

    it('should return thread detail correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2025-12-01T00:00:00.000Z',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      //Action
      const threadDetail = await threadRepositoryPostgres.getThreadById('thread-123');
      // Assert
      expect(threadDetail).toBeDefined();
      expect(threadDetail.id).toEqual('thread-123');
      expect(threadDetail.title).toEqual('sebuah thread');
      expect(threadDetail.body).toEqual('sebuah body thread');
      expect(threadDetail.date).toEqual('2025-11-30T17:00:00.000Z');
      expect(threadDetail.username).toEqual('masboy');
    });

    it('should return thread detail with correct properties', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-456',
        title: 'thread lain',
        body: 'sebuah body thread lain',
        date: '2025-12-01T00:00:00.000Z',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById('thread-456');

      // Assert
      expect(threadDetail).toHaveProperty('id', 'thread-456');
      expect(threadDetail).toHaveProperty('title', 'thread lain');
      expect(threadDetail).toHaveProperty('body', 'sebuah body thread lain');
      expect(threadDetail).toHaveProperty('date', '2025-11-30T17:00:00.000Z');
      expect(threadDetail).toHaveProperty('username', 'masboy');
    });

    it('should handle date as Date object and convert to ISO string', async () => {
      // Arrange
      const mockDate = new Date('2025-12-15T14:25:30.000Z');
      const mockPool = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [
            {
              id: 'thread-mock',
              title: 'thread mock',
              body: 'body mock',
              date: mockDate, // Return as Date object, not string
              username: 'masboy',
            },
          ],
        }),
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(mockPool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById('thread-mock');

      // Assert - Verifies that the else branch (.toISOString()) was executed
      expect(typeof threadDetail.date).toBe('string');
      expect(threadDetail.date).toBe('2025-12-15T14:25:30.000Z');
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('should return date as string when database returns string type', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [
            {
              id: 'thread-string-date',
              title: 'thread title',
              body: 'thread body',
              date: '2025-12-15T14:25:30.000Z', // Database returns as string
              username: 'testuser',
            },
          ],
        }),
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(mockPool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById('thread-string-date');

      // Assert - Verifies that the true branch (string check) was executed
      expect(typeof threadDetail.date).toBe('string');
      expect(threadDetail.date).toBe('2025-12-15T14:25:30.000Z');
    });
  });
});