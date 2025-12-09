class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, title, owner } = payload;
    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload({ id, title, owner }) {
    if (!id || !title || !owner) {
      throw new Error('ADDED_THREAD.LACK_REQUIRED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
    }
  }

}

module.exports = AddedThread;