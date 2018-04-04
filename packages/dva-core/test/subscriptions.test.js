import expect from 'expect';
import { create } from '../src/index';

describe('subscriptions', () => {
  it('dispatch action', () => {
    const app = create();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state, { payload }) {
          return state + payload || 1;
        },
      },
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'add', payload: 2 });
        },
      },
    });
    app.start();
    expect(app._store.getState().count).toEqual(2);
  });

  it('dispatch action with namespace will get a warn', () => {
    const app = create();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state, { payload }) {
          return state + payload || 1;
        },
      },
      subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'add', payload: 2 });
        },
      },
    });
    app.start();
    expect(app._store.getState().count).toEqual(2);
  });

  it('dispatch not valid action', () => {
    const app = create();
    app.model({
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup({ dispatch }) {
          dispatch('add');
        },
      },
    });
    expect(() => {
      app.start();
    }).toThrow(/dispatch: action should be a plain Object with type/);
  });

  it('dispatch action for other models', () => {
    const app = create();
    app.model({
      namespace: 'loading',
      state: false,
      reducers: {
        show() {
          return true;
        },
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
    app.start();
    expect(app._store.getState().loading).toEqual(true);
  });

  it('onError', () => {
    const errors = [];
    const app = create({
      onError: error => {
        errors.push(error.message);
      },
    });
    app.model({
      namespace: '-',
      state: {},
      subscriptions: {
        setup(_obj, done) {
          done('subscription error');
        },
      },
    });
    app.start();
    expect(errors).toEqual(['subscription error']);
  });

  it('onError async', done => {
    const errors = [];
    const app = create({
      onError: error => {
        errors.push(error.message);
      },
    });
    app.model({
      namespace: '-',
      state: {},
      subscriptions: {
        setup(_obj, done) {
          setTimeout(() => {
            done('subscription error');
          }, 100);
        },
      },
    });
    app.start();
    expect(errors).toEqual([]);
    setTimeout(() => {
      expect(errors).toEqual(['subscription error']);
      done();
    }, 200);
  });
});
