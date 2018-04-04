import expect from 'expect';
import { create } from '../src/index';

function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

describe('opts and hooks', () => {
  it('basic', done => {
    const app = create();

    app.model({
      namespace: 'loading',
      state: false,
      reducers: {
        show() {
          return true;
        },
        hide() {
          return false;
        },
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

  it('opts.onError prevent reject error', done => {
    let rejectCount = 0;
    const app = create({
      onError(e) {
        e.preventDefault();
      },
    });
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *add() {
          throw new Error('add failed');
        },
      },
    });
    app.start();
    app._store
      .dispatch({
        type: 'count/add',
      })
      .catch(() => {
        rejectCount += 1;
      });

    setTimeout(() => {
      expect(rejectCount).toEqual(0);
      done();
    }, 200);
  });

  it('opts.initialState', () => {
    const app = create({
      initialState: { count: 1 },
    });
    app.model({
      namespace: 'count',
      state: 0,
    });
    app.start();
    expect(app._store.getState().count).toEqual(1);
  });

  it('opts.onAction', () => {
    let count;
    const countMiddleware = () => () => () => {
      count += 1;
    };

    const app = create({
      onAction: countMiddleware,
    });
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

    const app = create({
      onAction: [countMiddleware, count2Middleware],
    });
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
    const app = create({
      extraEnhancers: [countEnhancer],
    });
    app.start();

    app._store.dispatch({ type: 'abc' });
    expect(count).toEqual(1);
  });

  it('opts.onStateChange', () => {
    let savedState = null;

    const app = create({
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
    app.start();

    app._store.dispatch({ type: 'count/add' });
    expect(savedState.count).toEqual(1);
  });
});
