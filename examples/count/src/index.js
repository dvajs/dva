import React from 'react';
import dva, { connect } from 'dva';
import { Router, Route } from 'dva/router';

// 1. Initialize
const app = dva();

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add(count) { return count + 1; },
    minus(count) { return count - 1; },
  },
});

// 3. View
const App = connect(({ count }) => ({
  count,
}))((props) => {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count/add' }); }}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count/minus' }); }}>-</button>
    </div>
  );
});

// 4. Router
app.router(({ history }) => {
  return (
    <Router history={history}>
      <Route path="/" component={App} />
    </Router>
  );
});

// 5. Start
app.start('#root');
