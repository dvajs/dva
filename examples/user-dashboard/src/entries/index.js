import './index.html';
import './index.less';
import dva, { connect } from 'dva';

// 1. Initialize
const app = dva();

// 2. Model
app.model(require('../models/users'));

// 3. Router
app.router(
  require('../routes')
);

// 4. Start
app.start('root');
