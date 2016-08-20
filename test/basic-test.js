import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('basic', () => {

  it.only('basic', () => {
    let sagaCount = 0;

    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        ['count/add'](state) {
          return state + 1;
        }
      },
      effects: {
        ['count/add']: function*({ payload }) {
          yield 1;
          sagaCount = sagaCount + payload;
        }
      }
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    app._store.dispatch({ type: 'count/add', payload: 1 });
    expect(app._store.getState().count).toEqual(1);
    expect(sagaCount).toEqual(1);
  });
});
