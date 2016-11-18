import './index.html';
import './index.less';
import dva from 'dva';
import { browserHistory } from 'dva/router';

// 1. Initialize
const app = dva({
  history: browserHistory,
});

// 2. Model
app.model(require('./models/users'));

// 3. Router
app.router(require('./router'));

// 4. Start
app.start('#root');
