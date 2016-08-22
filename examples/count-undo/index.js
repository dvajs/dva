import React from 'react';
import dva from '../../src/index';
import { connect } from '../../index';
import { Router, Route, useRouterHistory } from '../../router';
import { createHashHistory } from 'history';
import undoable, { ActionCreators } from 'redux-undo';

// 1. Initialize
const app = dva({
  onReducer: reducer => {
    return (state, action) => {
      const undoOpts = {};
      const newState = undoable(reducer, undoOpts)(state, action);
      return { ...newState, routing: newState.present.routing };
    };
  },
});

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add  (count) { return count + 1 },
    minus(count) { return count - 1 },
  },
});

// 3. View
const App = connect(state => ({
  count: state.present.count,
}))(function(props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count/add'})}}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count/minus'})}}>-</button>
      <button key="undo" onClick={() => { props.dispatch(ActionCreators.undo())}}>undo</button>
    </div>
  );
});

// 4. Router
app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={App} />
  </Router>
);

// 5. Start
app.start('#root');
