import expect from 'expect';
import React from 'react';
import dva from '../src/index';

function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

describe('dva', () => {
  it('basic', (done) => {
    const app = dva();

    app.model({
      namespace: 'loading',
      state: false,
      reducers: {
        show() { return true; },
        hide() { return false; },
      },
    });

    const nsAction = namespace => action => `${namespace}/${action}`;

    const ADD = 'add';
    const ADD_DELAY = 'addDelay';
    const countAction = nsAction('count');
    const loadingAction = nsAction('loading');

    app.model({
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: ADD });
        },
      },
      reducers: {
        [ADD](state, { payload }) {
          return state + payload || 1;
        },
      },
      effects: {
        *[ADD_DELAY]({ payload }, { call, put }) {
          yield put({ type: loadingAction('show') });
          yield call(delay, 100);
          yield put({ type: ADD, payload });
          yield put({ type: loadingAction('hide') });
        },
      },
    });
    app.router(() => <div />);
    app.start();

    expect(app._store.getState().count).toEqual(1);
    expect(app._store.getState().loading).toEqual(false);
    app._store.dispatch({ type: countAction(ADD_DELAY), payload: 2 });
    expect(app._store.getState().loading).toEqual(true);

    setTimeout(() => {
      expect(app._store.getState().count).toEqual(3);
      expect(app._store.getState().loading).toEqual(false);
      done();
    }, 500);
  });

  it('opts.initialState', () => {
    const app = dva({
      initialState: { count: 1 },
    });
    app.model({
      namespace: 'count',
      state: 0,
    });
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
    const countMiddleware = () => next => (action) => {
      count += 1;
      next(action);
    };
    const count2Middleware = () => next => (action) => {
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
    const countEnhancer = storeCreator => (reducer, preloadedState, enhancer) => {
      const store = storeCreator(reducer, preloadedState, enhancer);
      const oldDispatch = store.dispatch;
      store.dispatch = (action) => {
        count += 1;
        oldDispatch(action);
      };
      return store;
    };
    const app = dva({
      extraEnhancers: [countEnhancer],
    });
    app.router(() => 1);
    app.start();

    // @@router/LOCATION_CHANGE
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
