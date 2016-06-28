import React from 'react';
import dva, { connect } from 'dva';
import { Route } from 'dva/router';

// Initialize
const app = dva();

// Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    ['count/add'  ](count) { return count + 1 },
    ['count/minus'](count) { return count - 1 },
  },
});

// View
const Count = ({ count, dispatch }) =>
  <div>
    <h2>{ count }</h2>
    <button key="add" onClick={() => { dispatch({type: 'count/add'})}}>+</button>
    <button key="minus" onClick={() => { dispatch({type: 'count/minus'})}}>-</button>
  </div>
const HomePage = connect(({ count }) => ({ count }))(Count);

// Router
app.router(
  <Route path="/" component={HomePage} />
);

// Start
app.start('root');
