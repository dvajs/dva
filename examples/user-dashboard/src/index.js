import './index.html';
import './index.less';
import dva from 'dva';

// 1. Initialize
const app = dva({
  onError(error) {
    console.error(error.stack);
  },
});

// 2. Model
app.model(require('./models/users'));

// 3. Router
app.router(require('./router'));

// 4. Start
app.start('#root');
