const createServer = require('../createServer');

describe('/hello endpoint', () => {
  it('should return hello world and status 200', async () => {
    const server = await createServer();

    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.message).toEqual('hello world');
  });
});
