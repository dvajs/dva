import expect from 'expect';
import dva from 'dva';
import createLoading from '../src/index';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

describe('dva-loading', () => {
  it('normal', done => {
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

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({
      global: true,
      models: { count: true },
      effects: { 'count/addRemote': true },
    });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: { count: false },
        effects: { 'count/addRemote': false },
      });
      done();
    }, 200);
  });

  it('opts.effects', done => {
    const app = dva();
    app.use(
      createLoading({
        effects: true,
      })
    );
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

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({
      global: true,
      models: { count: true },
      effects: { 'count/addRemote': true },
    });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: { count: false },
        effects: { 'count/addRemote': false },
      });
      done();
    }, 200);
  });

  it('opts.namespace', () => {
    const app = dva();
    app.use(
      createLoading({
        namespace: 'fooLoading',
      })
    );
    app.model({
      namespace: 'count',
      state: 0,
    });
    app.router(() => 1);
    app.start();
    expect(app._store.getState().fooLoading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
  });

  it('opts.only', () => {
    const app = dva();
    app.use(
      createLoading({
        only: ['count/a'],
      })
    );
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 500);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
    app._store.dispatch({ type: 'count/a' });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: true,
        models: { count: true },
        effects: { 'count/a': true },
      });
      app._store.dispatch({ type: 'count/b' });
      setTimeout(() => {
        expect(app._store.getState().loading).toEqual({
          global: false,
          models: { count: false },
          effects: { 'count/a': false },
        });
      }, 300);
    }, 300);
  });

  it('opts.except', () => {
    const app = dva();
    app.use(
      createLoading({
        except: ['count/a'],
      })
    );
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 500);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
    app._store.dispatch({ type: 'count/a' });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: {},
        effects: {},
      });
      app._store.dispatch({ type: 'count/b' });
      setTimeout(() => {
        expect(app._store.getState().loading).toEqual({
          global: true,
          models: { count: true },
          effects: { 'count/b': true },
        });
      }, 300);
    }, 300);
  });

  it('opts.only and opts.except ambiguous', () => {
    expect(() => {
      const app = dva();
      app.use(
        createLoading({
          only: ['count/a'],
          except: ['count/b'],
        })
      );
    }).toThrow('ambiguous');
  });

  it('takeLatest', done => {
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
        addRemote: [
          function*(action, { put }) {
            yield delay(100);
            yield put({ type: 'add' });
          },
          { type: 'takeLatest' },
        ],
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
    });
    app._store.dispatch({ type: 'count/addRemote' });
    app._store.dispatch({ type: 'count/addRemote' });
    expect(app._store.getState().loading).toEqual({
      global: true,
      models: { count: true },
      effects: { 'count/addRemote': true },
    });
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: { count: false },
        effects: { 'count/addRemote': false },
      });
      done();
    }, 200);
  });

  it('multiple effects', done => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 100);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();
    app._store.dispatch({ type: 'count/a' });
    app._store.dispatch({ type: 'count/b' });
    setTimeout(() => {
      expect(app._store.getState().loading.models.count).toEqual(true);
    }, 200);
    setTimeout(() => {
      expect(app._store.getState().loading.models.count).toEqual(false);
      done();
    }, 800);
  });

  it('error catch', done => {
    const app = dva({
      onError(err) {
        err.preventDefault();
        console.log('failed', err.message);
      },
    });
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *throwError(action, { call }) {
          yield call(delay, 100);
          throw new Error('haha');
        },
      },
    });
    app.router(() => 1);
    app.start();

    app._store.dispatch({ type: 'count/throwError' });
    expect(app._store.getState().loading.global).toEqual(true);
    setTimeout(() => {
      expect(app._store.getState().loading.global).toEqual(false);
      done();
    }, 200);
  });
});
