const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository, newCommentValidator }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._newCommentValidator = newCommentValidator;
  }

  async execute(useCasePayload, threadId, owner) {
    try {
      this._newCommentValidator.validate(useCasePayload);
    } catch (error) {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    await this._threadRepository.verifyThreadExists(threadId);

    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(newComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;
