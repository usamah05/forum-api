/* eslint-disable camelcase */

const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const threadFromRepo = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const commentsFromRepo = [
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

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(threadFromRepo));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(commentsFromRepo));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread).toStrictEqual({
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

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
  });

  it('should hide deleted comments content', async () => {
    // Arrange
    const threadId = 'thread-123';

    const rawCommentsFromRepo = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        content: 'konten asli yang harusnya hilang',
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

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'sebuah thread',
        username: 'dicoding',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(rawCommentsFromRepo));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread.comments[0].content).toEqual('**komentar telah dihapus**');
    expect(detailThread.comments[1].content).toEqual('comment kedua');

    expect(detailThread.comments[0].is_delete).toBeUndefined();
  });

  it('should sort comments by date ascending', async () => {
    // Arrange
    const threadId = 'thread-123';

    const unsortedCommentsFromRepo = [
      {
        id: 'comment-456',
        date: '2024-01-03T00:00:00.000Z',
        content: 'comment ketiga',
      },
      {
        id: 'comment-123',
        date: '2024-01-01T00:00:00.000Z',
        content: 'comment pertama',
      },
      {
        id: 'comment-789',
        date: '2024-01-02T00:00:00.000Z',
        content: 'comment kedua',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(unsortedCommentsFromRepo));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread.comments).toHaveLength(3);

    expect(detailThread.comments[0].id).toEqual('comment-123');
    expect(detailThread.comments[0].date).toEqual('2024-01-01T00:00:00.000Z');

    expect(detailThread.comments[1].id).toEqual('comment-789');
    expect(detailThread.comments[1].date).toEqual('2024-01-02T00:00:00.000Z');

    expect(detailThread.comments[2].id).toEqual('comment-456');
    expect(detailThread.comments[2].date).toEqual('2024-01-03T00:00:00.000Z');
  });

  it('should return thread with empty comments when no comments found', async () => {
    // Arrange
    const threadId = 'thread-123';

    const threadFromRepo = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ ...threadFromRepo }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert

    expect(detailThread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2024-01-01',
      username: 'dicoding',
      comments: [], // <--- Inilah hasil transformasinya
    });

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
  });
});