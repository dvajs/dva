import './index.html';
import './index.less';
import * as React from "react";
import * as ReactDOM from "react-dom";

import dva from 'dva';
import { connect } from 'dva';
import { Router, Route } from 'dva/router';
import { RouterRedux } from 'dva/router';

// 1. Initialize
const app = dva();

const delay = ()=>{};
const key = (x,y)=>{};

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1; },
    minus(state) { return state - 1; },
  },
  effects: {
    *addDelay(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
    },
  },
  subscriptions: {
    // Monitor keyboard input
    keyboard({ dispatch }) {
      return key('ctrl+up', () => { dispatch({ type: 'addDelay'}); });
    },
  },
});

// 3. View
const App = connect(({ count }) => ({
  count
}))(function (props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count/add'})}}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count/minus'})}}>-</button>
    </div>
  );
});

// 4. Router
app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={App}/>
  </Router>
);

// 5. Start
app.start('#root');
