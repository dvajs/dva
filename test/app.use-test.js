import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('app.use', () => {

  it('initialState', () => {
    const app = dva({
      initialState: { count: 1 },
    });
    app.model({
      namespace: 'count',
      state: 0
    });
    app.router(({ history }) => <div />);
    app.start('#root');
    expect(app._store.getState().count).toEqual(1);
  });

  it('extraReducers', () => {
    const reducers = {
      count: (state, { type }) => {
        if (type === 'add') {
          return state + 1;
        }
        // default state
        return 0;
      }
    };
    const app = dva({
      extraReducers: reducers,
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    expect(app._store.getState().count).toEqual(0);
    app._store.dispatch({ type: 'add' });
    expect(app._store.getState().count).toEqual(1);
  });

  it('extraReducers: throw error if conflicts', () => {
    const app = dva({
      extraReducers: { routing: function () {} }
    });
    app.router(({ history }) => <div />);
    expect(() => {
      app.start('#root');
    }).toThrow(/app.start: extraReducers is conflict with other reducers/);
  });

  it('onAction', () => {
    let count;
    const countMiddleware = ({ dispatch, getState }) => next => action => {
      count = count + 1;
    };

    const app = dva({
      onAction: countMiddleware,
    });
    app.router(({ history }) => <div />);
    app.start();

    count = 0;
    app._store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });

  it('onReducer', () => {
    let count = 0;

    const undo = r => state => {
      const newState = r(state);
      return { present: newState, routing: newState.routing };
    };
    const app = dva({
      onReducer: undo,
    });
    app.model({
      namespace: 'count',
      state: 0,
    });
    app.router(({ history }) => <div />);
    app.start();

    expect(app._store.getState().present.count).toEqual(0);
  });
});
