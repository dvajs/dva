import expect from 'expect';
import dva from 'dva';
import createLoading from '../src/index';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

describe('dva-loading', () => {
  it('normal', (done) => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state) {
          return state + 1;
        },
      },
      effects: {
        *addRemote(action, { put }) {
          yield delay(100);
          yield put({ type: 'add' });
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({ global: false, models: {} });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({ global: true, models: { count: true } });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({ global: false, models: { count: false } });
      done();
    }, 200);
  });

  it('opts.effects', (done) => {
    const app = dva();
    app.use(createLoading({
      effects: true,
    }));
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state) {
          return state + 1;
        },
      },
      effects: {
        *addRemote(action, { put }) {
          yield delay(100);
          yield put({ type: 'add' });
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({ global: false, models: {}, effects: {} });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({ global: true, models: { count: true }, effects: { 'count/addRemote': true } });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({ global: false, models: { count: false }, effects: { 'count/addRemote': false } });
      done();
    }, 200);
  });

  it('opts.namespace', () => {
    const app = dva();
    app.use(createLoading({
      namespace: 'fooLoading',
    }));
    app.model({
      namespace: 'count',
      state: 0,
    });
    app.router(() => 1);
    app.start();
    expect(app._store.getState().fooLoading).toEqual({ global: false, models: {} });
  });

  it('takeLatest', (done) => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state) { return state + 1; },
      },
      effects: {
        addRemote: [function* (action, { put }) {
          yield delay(100);
          yield put({ type: 'add' });
        }, { type: 'takeLatest' }],
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({ global: false, models: {} });
    app._store.dispatch({ type: 'count/addRemote' });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({ global: true, models: { count: true } });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({ global: false, models: { count: false } });
      done();
    }, 200);
  });

  it.only('multiple effects', (done) => {
    const app = dva();
    app.use(createLoading({ effects: true }));
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 100);
          console.log('a done');
        },
        *b(action, { call }) {
          yield call(delay, 500);
          console.log('b done');
        },
      },
    });
    app.router(() => 1);
    app.start();
    console.log(app._store.getState().loading);
    app._store.dispatch({ type: 'count/a' });
    app._store.dispatch({ type: 'count/b' });
    console.log(app._store.getState().loading);
    setTimeout(() => {
      console.log(app._store.getState().loading);
    }, 200);
    setTimeout(() => {
      console.log(app._store.getState().loading);
      done();
    }, 1000);
  });
});
