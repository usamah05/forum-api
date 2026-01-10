const pool = require('../../database/postgres/pool');
const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AuthenticationTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('Threads endpoint', () => {
  let server;
  let accessToken;
  let threadId;

  beforeAll(async () => {
    server = await createServer(container);

    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });

    const loginData = JSON.parse(loginResponse.payload);
    accessToken = loginData.data.accessToken;

    // add thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const threadData = JSON.parse(threadResponse.payload);
    threadId = threadData.data.addedThread.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  let testCounter = 0;

  async function getAccessToken() {
    testCounter++;
    const username = `masboy${testCounter}`;
    const password = 'secret';
    const fullname = 'Mas Boy';
    const userId = `user-${testCounter}`;

    // Add user directly using test helper
    await UserTableTestHelper.addUser({
      id: userId,
      username,
      password,
      fullname,
    });

    // Create authentication tokens
    const authenticationTokenManager = container.getInstance('AuthenticationTokenManager');
    const accessToken = await authenticationTokenManager.createAccessToken({
      username,
      id: userId,
    });
    const refreshToken = await authenticationTokenManager.createRefreshToken({
      username,
      id: userId,
    });

    // Add token to database
    const authenticationRepository = container.getInstance('AuthenticationRepository');
    await authenticationRepository.addToken(refreshToken);

    return accessToken;
  }

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      const accessToken = await getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      console.log('POST /threads response:', response.payload);
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
      };

      const server = await createServer(container);
      const accessToken = await getAccessToken(server);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: true,
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      const accessToken = await getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when "title" contain more than 50 characters', async () => {
      // Arrange
      const requestPayload = {
        title: 'a'.repeat(51),
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      const accessToken = await getAccessToken(server);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena karakter judul melebihi batas maksimal');
    });

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 401 when access token invalid', async () => {
      //Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: 'Bearer invalidtoken'
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Invalid token structure');
    });

    it('should persist thread to database', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      const accessToken = await getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const { id: threadId } = responseJson.data.addedThread;

      // Assert
      const thread = await ThreadTableTestHelper.findThreadById(threadId);
      expect(thread).toHaveLength(1);
      expect(thread[0].title).toEqual(requestPayload.title);
      expect(thread[0].body).toEqual(requestPayload.body);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    beforeEach(async () => {
      // Recreate user and thread for each test
      await UserTableTestHelper.addUser({
        id: 'user-1',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Create authentication tokens
      const authenticationTokenManager = container.getInstance('AuthenticationTokenManager');
      accessToken = await authenticationTokenManager.createAccessToken({
        username: 'dicoding',
        id: 'user-1',
      });

      // Add authentication
      const authenticationRepository = container.getInstance('AuthenticationRepository');
      const refreshToken = await authenticationTokenManager.createRefreshToken({
        username: 'dicoding',
        id: 'user-1',
      });
      await authenticationRepository.addToken(refreshToken);

      // Create thread using test helper
      threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        userId: 'user-1',
        owner: 'user-1',
      });
    });

    it('should response 200 and return thread detail', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('sebuah thread');
      expect(responseJson.data.thread.body).toEqual('sebuah body thread');
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toEqual([]);
    });

    it('should response 200 and return thread detail with comments', async () => {
      // Arrange - add comments
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'comment pertama',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'comment kedua',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('comment pertama');
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[1].content).toEqual('comment kedua');
    });

    it('should response 200 and hide deleted comments content', async () => {
      // Arrange - add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { data: { addedComment } } = JSON.parse(commentResponse.payload);

      // delete comment
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 200 and sort comments by date ascending', async () => {
      // Arrange - add comments with delay to ensure different timestamps
      const comment1Response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'comment pertama',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(comment1Response.statusCode).toEqual(201);
      const comment1 = JSON.parse(comment1Response.payload);
      const comment1Id = comment1.data.addedComment.id;

      // Add small delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comment2Response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'comment kedua',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(comment2Response.statusCode).toEqual(201);
      const comment2 = JSON.parse(comment2Response.payload);
      const comment2Id = comment2.data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].id).toEqual(comment1Id);
      expect(responseJson.data.thread.comments[0].content).toEqual('comment pertama');
      expect(responseJson.data.thread.comments[1].id).toEqual(comment2Id);
      expect(responseJson.data.thread.comments[1].content).toEqual('comment kedua');
    });

    it('should response 404 when thread not found', async () => {
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-999',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 without authentication', async () => {
      // Action - get thread without access token
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
