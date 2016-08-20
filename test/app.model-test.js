import expect from 'expect';
import React from 'react';
import dva from '../src/index';
import { take, call } from '../effects';

describe('app.model', () => {
  it('reducer enhancer', () => {
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
      reducers: [ {
        ['add'](state) {
          return state + 1;
        }
      }, enhancer ]
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    app._store.dispatch({ type: 'square' });
    app._store.dispatch({ type: 'count/add' });
    expect(app._store.getState().count).toEqual(10);
  });

  it('effects: type takeEvery', () => {
    let count = 0;
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        ['add']: function*() {
          yield 1;
          count = count + 1;
        }
      }
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    app._store.dispatch({ type: 'count/add' });
    app._store.dispatch({ type: 'count/add' });
    expect(count).toEqual(2);
  });

  it('effects: type takeLatest', (done) => {
    let count = 0;
    const app = dva();
    const delay = (timeout) => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
    };
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        ['add']: [ function*() {
          yield call(delay, 1);
          count = count + 1;
        }, {
          type: 'takeLatest'
        } ]
      }
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    // Only catch the last one.
    app._store.dispatch({ type: 'count/add' });
    app._store.dispatch({ type: 'count/add' });

    setTimeout(() => {
      expect(count).toEqual(1);
      done();
    }, 100);
  });

  it('effects: type watcher', (done) => {
    let count = 0;
    const app = dva();
    const delay = (timeout) => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
    };
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        ['addWatcher']: [ function*() {
          /*eslint-disable no-constant-condition*/
          while(true) {
            yield take('add');
            yield delay(1);
            count = count + 1;
          }
        }, {
          type: 'watcher'
        } ]
      }
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    // Only catch the first one.
    app._store.dispatch({ type: 'add' });
    app._store.dispatch({ type: 'add' });

    setTimeout(() => {
      expect(count).toEqual(1);
      done();
    }, 100);
  });

  it('effects: onError', () => {
    const errors = [];
    const app = dva({
      onError: (error) => {
        errors.push(error.message);
      }
    });

    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        ['add']: function*() {
          yield 1;
          throw new Error('effect error');
        }
      }
    });
    app.router(({ history }) => <div />);
    app.start('#root');
    app._store.dispatch({ type: 'count/add' });

    expect(errors).toEqual([ 'effect error' ]);
  });

  it('subscriptions: onError', (done) => {
    const errors = [];
    const app = dva({
      onError: (error) => {
        errors.push(error.message);
      }
    });

    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        ['add']: function*() {
          yield 1;
          throw new Error('effect error');
        }
      },
      subscriptions: [
        function ({ dispatch }, done) {
          dispatch({ type: 'count/add' });
          setTimeout(() => {
            done('subscription error');
          }, 100);
        }
      ]
    });
    app.router(({ history }) => <div />);
    app.start('#root');

    setTimeout(() => {
      expect(errors).toEqual([ 'effect error', 'subscription error' ]);
      done();
    }, 500);
  });

  it('dynamic model', () => {
    let count = 0;

    const app = dva();
    app.model({
      namespace: 'users',
      state: [],
      reducers: {
        'add'(state, { payload }) {
          return [...state, payload];
        },
      },
    });
    app.router(_ => <div />);
    app.start('#root');

    // inject model
    app.model({
      namespace: 'tasks',
      state: [],
      reducers: {
        'add'(state, { payload }) {
          return [...state, payload];
        },
      },
      effects: {
        *'add'() {
          yield 1;
          count = count + 1;
        },
      },
      subscriptions: [
        function() {
          count = count + 1;
        }
      ],
    });

    // subscriptions
    expect(count).toEqual(1);

    // reducers
    app._store.dispatch({ type: 'tasks/add', payload: 'foo' });
    app._store.dispatch({ type: 'users/add', payload: 'foo' });
    const state = app._store.getState();
    expect(state.users).toEqual(['foo']);
    expect(state.tasks).toEqual(['foo']);

    // effects
    expect(count).toEqual(2);
  });
});
