import React from 'react';
import dva, { connect } from 'dva';
import undoable, { ActionCreators } from 'redux-undo';

import counter from './models/counter';

// 1. Initialize
const app = dva({
  onReducer: reducer => (state, action) => {
    const newState = undoable(reducer, {})(state, action);
    return { ...newState };
  },
});

// 2. Model
app.model(counter);

// 3. View
const App = connect(({ present: { counter } }) => ({
  counter,
}))(props => {
  return (
    <div style={{ textAlignLast: 'center' }}>
      <h2>Count: {props.counter}</h2>
      <button
        onClick={() => {
          props.dispatch({ type: 'counter/minus' });
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          props.dispatch({ type: 'counter/add' });
        }}
      >
        +
      </button>
      <button
        style={{ marginLeft: 20 }}
        onClick={() => {
          props.dispatch(ActionCreators.undo());
        }}
      >
        Undo
      </button>
      <button
        onClick={() => {
          props.dispatch(ActionCreators.redo());
        }}
      >
        Redo
      </button>
    </div>
  );
});

// 4. Router
app.router(() => <App />);

// 5. Start
app.start('#root');
