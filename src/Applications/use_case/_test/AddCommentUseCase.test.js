const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should throw InvariantError when payload validation fails', async () => {
    // Arrange
    const useCasePayload = {
      content: 123,
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockNewCommentValidator = {
      validate: jest.fn().mockImplementation(() => {
        throw new Error('validation error');
      }),
    };

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      newCommentValidator: mockNewCommentValidator,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload, threadId, owner))
      .rejects.toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(mockNewCommentValidator.validate).toHaveBeenCalledWith(useCasePayload);
  });

  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockNewCommentValidator = {
      validate: jest.fn().mockImplementation(() => {}),
    };

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());


    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      })));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      newCommentValidator: mockNewCommentValidator,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, threadId, owner);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockNewCommentValidator.validate).toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);

    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new NewComment(useCasePayload),
      threadId,
      owner
    );
  });
});