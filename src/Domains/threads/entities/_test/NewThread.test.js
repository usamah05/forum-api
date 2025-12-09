const NewThread = require('../NewThread');

describe('a NewThread entity', () => {
  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });

  it('should throw error when "title" is missing', () => {
    // Arrange
    const payload = {
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });
  it('should throw error when "body" is missing', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "title" is not a string', () => {
    // Arrange
    const payload = {
      title: 123,
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "body" is not a string', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: 123,
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.DATA_TYPE_NOT_MEET_SPECIFICATION');
  });

  it('should throw error when "title" length is more than 50 characters', () => {
    // Arrange
    const payload = {
      title: 'a'.repeat(51),
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should not throw error when "title" length is 50 characters', () => {
    // Arrange
    const payload = {
      title: 'a'.repeat(50),
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).not.toThrowError();
  });

  it('should not throw error when payload is valid', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).not.toThrowError();
  });
});

describe('_verifyPayload method', () => {
  it('should throw error when "title" is empty string', () => {
    // Arrange
    const payload = {
      title: '',
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should throw error when "body" is empty string', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: '',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.LACK_REQUIRED_PROPERTY');
  });

  it('should not throw error when payload is valid', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).not.toThrowError();
  });
});