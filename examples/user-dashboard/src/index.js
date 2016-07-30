import './index.html';
import './index.less';
import dva from 'dva';

// 1. Initialize
const app = dva({
  onError(error) {
    console.error(error.stack);
  },
});

// 2. Plugins
app.use(hmr());

// 3. Model
app.model(require('./models/users'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start(document.getElementById('root'));

// Hmr helper
// This will be move to babel plugin in later versions.
function hmr() {
  return {
    onHmr(render) {
      if (module.hot) {
        const renderNormally = render;
        const renderException = (error) => {
          const RedBox = require('redbox-react');
          ReactDOM.render(<RedBox error={error} />, document.etElementById('root'));
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
  };
}
