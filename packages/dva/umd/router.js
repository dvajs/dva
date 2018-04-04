const assign = require('object-assign');
const router = require('react-router-dom');
const routerRedux = require('react-router-redux');

module.exports = assign({}, router, {
  routerRedux: routerRedux,
});
