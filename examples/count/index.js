import React from 'react';
import dva, { connect } from 'dva';
import { Route } from 'dva/router';

const app = dva();

app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    ['count/add'  ](count) { return count + 1 },
    ['count/minus'](count) { return count - 1 },
  },
});

const Count = ({ count, dispatch }) =>
  <div>
    <h2>{ count }</h2>
    <button key="add" onClick={() => { dispatch({type: 'count/add'})}}>+</button>
    <button key="minus" onClick={() => { dispatch({type: 'count/minus'})}}>-</button>
  </div>

const HomePage = connect(({ count }) => ({ count }))(Count);

app.router(
  <Route path="/" component={HomePage} />
);

app.start('root');
