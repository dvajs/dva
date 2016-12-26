import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('subscriptions', () => {
  it('type error', () => {
    const app = dva();
    expect(() => {
      app.model({
        namespace: '_',
        subscriptions: [],
      });
    }).toThrow(/app.model: subscriptions should be Object/);
    expect(() => {
      app.model({
        namespace: '_',
        subscriptions: '_',
      });
    }).toThrow(/app.model: subscriptions should be Object/);
    expect(() => {
      app.model({
        namespace: '_',
      });
    }).toNotThrow();
  });

  it('dispatch action', () => {
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state, { payload }) { return state + payload || 1; },
      },
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'add', payload: 2 });
        },
      },
    });
    app.router(() => <div />);
    app.start();
    expect(app._store.getState().count).toEqual(2);
  });

  it('dispatch action with namespace will get a warn', () => {
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state, { payload }) { return state + payload || 1; },
      },
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'count/add', payload: 2 });
        },
      },
    });
    app.router(() => <div />);
    app.start();
    expect(app._store.getState().count).toEqual(2);
  });

  it('dispatch not valid action', () => {
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup({ dispatch }) {
          dispatch('add');
        },
      },
    });
    app.router(() => <div />);
    expect(() => {
      app.start();
    }).toThrow(/dispatch: action should be a plain Object with type/);
  });

  it('dispatch action for other models', () => {
    const app = dva();
    app.model({
      namespace: 'loading',
      state: false,
      reducers: {
        show() { return true; },
      },
    });
    app.model({
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'loading/show' });
        },
      },
    });
    app.router(() => <div />);
    app.start();
    expect(app._store.getState().loading).toEqual(true);
  });

  it('onError', () => {
    const errors = [];
    const app = dva({
      onError: (error) => {
        errors.push(error.message);
      },
    });
    app.model({
      namespace: '-',
      state: {},
      subscriptions: {
        setup({ dispatch }, done) {
          done('subscription error');
        },
      },
    });
    app.router(() => <div />);
    app.start();
    expect(errors).toEqual(['subscription error']);
  });

  it('onError async', (done) => {
    const errors = [];
    const app = dva({
      onError: (error) => {
        errors.push(error.message);
      },
    });
    app.model({
      namespace: '-',
      state: {},
      subscriptions: {
        setup({ dispatch }, done) {
          setTimeout(() => {
            done('subscription error');
          }, 100);
        },
      },
    });
    app.router(() => <div />);
    app.start();
    expect(errors).toEqual([]);
    setTimeout(() => {
      expect(errors).toEqual(['subscription error']);
      done();
    }, 200);
  });
});
