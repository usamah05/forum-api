const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
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
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw Error when thread is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'masboy' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-xxx'))
        .rejects.toThrowError(NotFoundError);
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
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.username).toEqual('masboy');
      expect(thread.date).toBeDefined();
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
      expect(threadDetail.id).toEqual('thread-123');
      expect(threadDetail.title).toEqual('sebuah thread');
      expect(threadDetail.body).toEqual('sebuah body thread');
      expect(threadDetail.username).toEqual('masboy');
      expect(threadDetail.date).toBeDefined();
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
      expect(threadDetail.id).toEqual('thread-456');
      expect(threadDetail.title).toEqual('thread lain');
      expect(threadDetail.body).toEqual('sebuah body thread lain');
      expect(threadDetail.username).toEqual('masboy');
      expect(threadDetail.date).toBeDefined();
    });

    it('should handle date as Date object from database', async () => {
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

      // Assert - Repository returns raw data without conversion
      expect(threadDetail.date).toBe(mockDate);
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

      // Assert - Repository returns raw string data without conversion
      expect(threadDetail.date).toBe('2025-12-15T14:25:30.000Z');
    });
  });
});