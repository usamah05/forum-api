class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const threadDate = typeof thread.date === 'string' ? thread.date : thread.date.toISOString();

    const processedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: typeof comment.date === 'string' ? comment.date : comment.date.toISOString(),
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: threadDate,
      username: thread.username,
      comments: processedComments,
    };
  }
}

module.exports = GetDetailThreadUseCase;