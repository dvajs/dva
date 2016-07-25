import './index.html';
import './index.less';
import dva, { connect } from 'dva';

// 1. Initialize
const app = dva();

// 2. Model
app.model(require('./models/users'));

// 3. Router
app.router(require('./router'));

// 4. Start
app.start(document.getElementById('root'), {

  // Support Routes HMR.
  // This will be implemented in babel plugin later.
  hmr: (render) => {
    if (module.hot) {
      const renderNormally = render;
      const renderException = (error) => {
        const RedBox = require('redbox-react');
        ReactDOM.render(<RedBox error={error} />, document.getElementById('root'));
      };
      const newRender = (router) => {
        try {
          renderNormally(router);
        } catch (error) {
          console.error('error', error);
          renderException(error);
        }
      };
      module.hot.accept('./router', () => {
        const router = require('./router');
        newRender(router);
      });
    }
  },
});


