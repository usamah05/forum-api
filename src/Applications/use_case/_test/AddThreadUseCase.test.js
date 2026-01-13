const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
  });

  it('should throw error when "title" is missing', async () => {
    // Arrange
    const useCasePayload = {
      body: 'sebuah body thread',
    };

    const mockThreadRepository = new ThreadRepository();

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects.toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "body" is missing', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
    };
    const mockThreadRepository = new ThreadRepository();

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects.toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "title" is not a string', async () => {
    // Arrange
    const useCasePayload = {
      title: 123,
      body: 'sebuah body thread',
    };
    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects.toThrowError('NEW_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "body" is not a string', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 123,
    };
    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects.toThrowError('NEW_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "title" exceeds 50 character', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a'.repeat(51),
      body: 'sebuah body thread',
    };
    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects.toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create NewThread entity correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
  });
});