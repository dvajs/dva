import './index.html';
import './index.less';
import dva, { connect } from 'dva';

// 1. Initialize
const app = dva();

// 2. Model
app.model(require('../models/users'));

// 3. Router
app.router(require('../routes'));

// 4. Start
const { render } = app.start('root');

// Support Routes HMR.
// This will be implemented in babel plugin later.
if (module.hot) {
  const renderNormally = render;
  const renderException = (error) => {
    const RedBox = require('redbox-react');
    ReactDOM.render(<RedBox error={error} />, document.getElementById('root'));
  };
  const newRender = (routes) => {
    try {
      renderNormally(routes);
    } catch (error) {
      console.error('error', error);
      renderException(error);
    }
  };
  module.hot.accept('../routes', () => {
    const routes = require('../routes');
    newRender(routes);
  });
}
