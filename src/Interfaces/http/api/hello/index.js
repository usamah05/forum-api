const routes = require('./routes');

module.exports = {
  name: 'hello',
  register: async (server) => {
    server.route(routes());
  },
};
