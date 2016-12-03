import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('reducers', () => {

  it('type error', () => {
    const app = dva();
    expect(_ => {
      app.model({
        namespace: '_array',
        reducers: [{}, () => {}],
      });
    }).toNotThrow();
    expect(_ => {
      app.model({
        namespace: '_object',
        reducers: {},
      });
    }).toNotThrow();
    expect(_ => {
      app.model({
        namespace: '_neither',
        reducers: '_',
      });
    }).toThrow(/app.model: reducers should be Object or array/);
    expect(_ => {
      app.model({
        namespace: '_none',
        reducers: [],
      });
    }).toThrow(/app.model: reducers with array should be app.model\({ reducers: \[object, function\] }\)/);
  });

  it('enhancer', () => {
    function enhancer(reducer) {
      return (state, action) => {
        if (action.type === 'square') {
          return state * state;
        }
        return reducer(state, action);
      };
    }

    const app = dva();
    app.model({
      namespace: 'count',
      state: 3,
      reducers: [{
        add(state, { payload }) { return state + (payload || 1); },
      }, enhancer],
    });
    app.router(({ history }) => <div />);
    app.start();

    app._store.dispatch({ type: 'square' });
    app._store.dispatch({ type: 'count/add' });
    expect(app._store.getState().count).toEqual(10);
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
    app.router(_ => <div />);
    app.start();

    expect(app._store.getState().count).toEqual(0);
    app._store.dispatch({ type: 'add' });
    expect(app._store.getState().count).toEqual(1);
  });

  it('extraReducers: throw error if conflicts', () => {
    const app = dva({
      extraReducers: { routing: function () {} }
    });
    app.router(_ => <div />);
    expect(() => {
      app.start();
    }).toThrow(/app.start: extraReducers is conflict with other reducers/);
  });

  it('onReducer', () => {
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
