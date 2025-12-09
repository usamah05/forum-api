const ThreadRepository = require('../ThreadRepository');

describe('a ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.verifyThreadExists('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

describe('addThread function', () => {
  it('should throw error when addThread is not implemented', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();
    const newThread = {
      title: 'A Thread Title',
      body: 'A Thread Body',
    };

    // Action and Assert
    await expect(threadRepository.addThread(newThread)).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

describe('getThreadById function', () => {
  it('should throw error when getThreadById is not implemented', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();
    const threadId = 'thread-123';

    // Action and Assert
    await expect(threadRepository.getThreadById(threadId)).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

describe('verityThreadExists function', () => {
  it('should throw error when verityThreadExists is not implemented', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();
    const threadId = 'thread-123';

    // Action and Assert
    await expect(threadRepository.verifyThreadExists(threadId)).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});