import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import dva, { connect } from '../dist/index';

test('normal', () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });
  app.router(() => <div />);
  app.start();

  expect(app._store.getState().count).toEqual(0);
  app._store.dispatch({ type: 'count/add' });
  expect(app._store.getState().count).toEqual(1);
});

test('connect', () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });
  const App = connect(state => ({ count: state.count }))(
    ({ count, dispatch }) => {
      return (
        <>
          <div data-testid="count">{count}</div>
          <button
            onClick={() => {
              dispatch({ type: 'count/add' });
            }}
          >
            add
          </button>
        </>
      );
    },
  );
  app.router(() => <App />);
  app.start();

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('count').innerHTML).toEqual('0');
  fireEvent.click(getByText('add'));
  expect(getByTestId('count').innerHTML).toEqual('1');
});
