const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { title, body, owner } = useCasePayload;
    const newThread = new NewThread({ title, body, owner });
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;