import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('app.use', () => {

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
    app.start(document.getElementById('root'));

    expect(app.store.getState().count).toEqual(0);
    app.store.dispatch({ type: 'add' });
    expect(app.store.getState().count).toEqual(1);
  });

  it('extraReducers: throw error if conflicts', () => {
    const app = dva({
      extraReducers: { routing: function () {} }
    });
    app.router(({ history }) => <div />);
    expect(() => {
      app.start(document.getElementById('root'));
    }).toThrow(/Reducers should not be conflict with namespace in model/);
  });

  it('onAction', () => {
    let count = 0;
    const countMiddleware = ({ dispatch, getState }) => next => action => {
      count = count + 1;
    };

    const app = dva({
      onAction: countMiddleware,
    });
    app.router(({ history }) => <div />);
    app.start();

    app.store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });

  it('onReducer', () => {
    let count = 0;

    const undo = r => state => ({ present: r(state) });
    const app = dva({
      onReducer: undo,
    });
    app.model({
      namespace: 'count',
      state: 0,
    });
    app.router(({ history }) => <div />);
    app.start();

    expect(app.store.getState().present.count).toEqual(0);
  });
});
