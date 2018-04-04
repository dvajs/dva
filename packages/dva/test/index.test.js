import expect from 'expect';
import React from 'react';
import dva from '../src/index';

const countModel = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload || 1;
    },
    minus(state, { payload }) {
      return state - payload || 1;
    },
  },
};

describe('index', () => {
  xit('normal', () => {
    const app = dva();
    app.model({ ...countModel });
    app.router(() => <div />);
    app.start('#root');
  });

  it('start without container', () => {
    const app = dva();
    app.model({ ...countModel });
    app.router(() => <div />);
    app.start();
  });

  it('throw error if no routes defined', () => {
    const app = dva();
    expect(() => {
      app.start();
    }).toThrow(/router must be registered before app.start/);
  });

  it('opts.initialState', () => {
    const app = dva({
      initialState: { count: 1 },
    });
    app.model({ ...countModel });
    app.router(() => <div />);
    app.start();
    expect(app._store.getState().count).toEqual(1);
  });

  it('opts.onAction', () => {
    let count;
    const countMiddleware = () => () => () => {
      count += 1;
    };

    const app = dva({
      onAction: countMiddleware,
    });
    app.router(() => <div />);
    app.start();

    count = 0;
    app._store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });

  it('opts.onAction with array', () => {
    let count;
    const countMiddleware = () => next => action => {
      count += 1;
      next(action);
    };
    const count2Middleware = () => next => action => {
      count += 2;
      next(action);
    };

    const app = dva({
      onAction: [countMiddleware, count2Middleware],
    });
    app.router(() => <div />);
    app.start();

    count = 0;
    app._store.dispatch({ type: 'test' });
    expect(count).toEqual(3);
  });

  it('opts.extraEnhancers', () => {
    let count = 0;
    const countEnhancer = storeCreator => (
      reducer,
      preloadedState,
      enhancer
    ) => {
      const store = storeCreator(reducer, preloadedState, enhancer);
      const oldDispatch = store.dispatch;
      store.dispatch = action => {
        count += 1;
        oldDispatch(action);
      };
      return store;
    };
    const app = dva({
      extraEnhancers: [countEnhancer],
    });
    app.router(() => <div />);
    app.start();

    app._store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });

  it('opts.onStateChange', () => {
    let savedState = null;

    const app = dva({
      onStateChange(state) {
        savedState = state;
      },
    });
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

    app._store.dispatch({ type: 'count/add' });
    expect(savedState.count).toEqual(1);
  });
});
