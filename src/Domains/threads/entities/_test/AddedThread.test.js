const AddedThread = require('../AddedThread');

describe('a AddedThread entity', () => {
  it('should create AddedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });

  it('should throw error when "id" is missing', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "title" is missing', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "owner" is missing', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "id" is not a string', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'sebuah thread',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "title" is not a string', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "owner" is not a string', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should not throw error when payload is valid', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    };

    //Action
    const addedThread = () => new AddedThread(payload);

    // Assert
    expect(addedThread).not.toThrowError();
  });
});