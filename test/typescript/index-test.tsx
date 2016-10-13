import dva, { connect } from '../../index';
import { routerRedux } from '../../router';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * dva()
 */
const app = dva({
  onError(e) {
    e.message;
    e.stack;
  },
  onAction: [],
  onStateChange: () => {},
  onReducer: () => {},
  onEffect: () => {},
  onHmr: () => {},
  extraReducers: {
    form() {},
  },
});
// no option
dva();

/**
 * app.use()
 */
app.use({
  onError() {}
})

/**
 * app.model()
 */
app.model({
  namespace: 'count',
  state: 0,
  subscriptions: {
    setup({ dispatch, history }, done) {},
  },
  effects: {
    *addRemote({ type }, { call, put, select, take, cancel }) {
      yield put({
        type: 'a',
      });
      yield put(routerRedux.push('/'));
    },
    // Support effect with type
    minusRemote: [
      function*() {},
      { type: 'takeLatest' }
    ],
  },
  reducers: {
    add(state) { return state + 1 },
    minus(state) { return state - 1 },
  },
});
// Support reducers with reducer enhancer
app.model({
  namespace: 'x',
  reducers: [{}, () => {}],
});

/**
 * connect()
 */
function App() {
  return <div>App</div>;
}
connect()(App);
const AppContainer = connect((state) => ({ count: state.count }))(App);

/**
 * app.router()
 */
app.router(() => <div />);
app.router(({ history }) => <div />);

// dynamic route
app.router(({ history, app }) => {
  app.model({
    namespace: 'x'
  });
  return {};
});

/**
 * app.start()
 */
app.start('#root');
app.start(document.getElementById('#root'));

// with no arguments
const jsx = app.start();
ReactDOM.render(jsx, document.getElementById('#root'));
