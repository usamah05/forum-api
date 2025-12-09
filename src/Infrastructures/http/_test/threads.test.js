const pool = require('../../database/postgres/pool');
const UserTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AuthenticationTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('Threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UserTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'masboy',
          password: 'secret',
          fullname: 'Mas Boy',
        },
      });

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'masboy',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(authenticationResponse.payload);

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
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'masboy',
          password: 'secret',
          fullname: 'Mas Boy',
        },
      });

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'masboy',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(authenticationResponse.payload);

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
        title: 123,
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'masboy',
          password: 'secret',
          fullname: 'Mas Boy',
        },
      });

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'masboy',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(authenticationResponse.payload);

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

    it('should response 400 when "titile" contain more than 50 characters', async () => {
      // Arrange
      const requestPayload = {
        title: 'a'.repeat(51),
        body: 'sebuah body thread',
      };

      const server = await createServer(container);
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'masboy',
          password: 'secret',
          fullname: 'Mas Boy',
        },
      });

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'masboy',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(authenticationResponse.payload);

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

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'masboy',
          password: 'secret',
          fullname: 'Mas Boy',
        },
      });

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'masboy',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(authenticationResponse.payload);

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
});

