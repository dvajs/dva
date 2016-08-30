import { hashHistory, match } from 'react-router';
import {
  routerMiddleware,
  syncHistoryWithStore,
  routerReducer as routing
} from 'react-router-redux';
import createDva from './createDva';

export default createDva({
  mobile: false,
  initialReducer: {
    routing,
  },
  defaultHistory: hashHistory,
  routerMiddleware: routerMiddleware,

  setupHistory(history) {
    this._history = syncHistoryWithStore(history, this._store);
  },
});
