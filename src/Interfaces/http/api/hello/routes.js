const routes = () => ([
  {
    method: 'GET',
    path: '/hello',
    handler: (request, h) => h.response({
      message: 'hello world',
    }),
  },
]);

module.exports = routes;
