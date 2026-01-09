/* eslint-disable camelcase */

const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'john',
        date: '2024-01-02T00:00:00.000Z',
        content: 'comment kedua',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2024-01-01T00:00:00.000Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-456',
          username: 'john',
          date: '2024-01-02T00:00:00.000Z',
          content: 'comment kedua',
        },
      ],
    });
    expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
  });

  it('should hide deleted comments content', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        content: 'sebuah comment',
        is_delete: true,
      },
      {
        id: 'comment-456',
        username: 'john',
        date: '2024-01-02T00:00:00.000Z',
        content: 'comment kedua',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread.comments[0].content).toEqual('**komentar telah dihapus**');
    expect(detailThread.comments[1].content).toEqual('comment kedua');
  });

  it('should sort comments by date ascending', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const expectedComments = [
      {
        id: 'comment-456',
        username: 'john',
        date: '2024-01-03T00:00:00.000Z',
        content: 'comment ketiga',
        is_delete: false,
      },
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        content: 'comment pertama',
        is_delete: false,
      },
      {
        id: 'comment-789',
        username: 'jane',
        date: '2024-01-02T00:00:00.000Z',
        content: 'comment kedua',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread.comments).toHaveLength(3);
    expect(detailThread.comments[0].id).toEqual('comment-123');
    expect(detailThread.comments[0].content).toEqual('comment pertama');
    expect(detailThread.comments[1].id).toEqual('comment-789');
    expect(detailThread.comments[1].content).toEqual('comment kedua');
    expect(detailThread.comments[2].id).toEqual('comment-456');
    expect(detailThread.comments[2].content).toEqual('comment ketiga');
  });

  it('should return thread with empty comments when no comments found', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
      comments: [],
    });
  });
});