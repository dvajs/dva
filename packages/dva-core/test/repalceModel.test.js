import expect from 'expect';
import EventEmitter from 'events';
import { create } from '../src/index';

describe('app.replaceModel', () => {
  it('should not be available before app.start() get called', () => {
    const app = create();

    expect('replaceModel' in app).toEqual(false);
  });

  it("should add model if it doesn't exist", () => {
    const app = create();
    app.start();

    const oldCount = app._models.length;

    app.replaceModel({
      namespace: 'users',
      state: [],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
    });

    expect(app._models.length).toEqual(oldCount + 1);

    app._store.dispatch({ type: 'users/add', payload: 'jack' });
    const state = app._store.getState();
    expect(state.users).toEqual(['jack']);
  });

  it('should run new reducers if model exists', () => {
    const app = create();
    app.model({
      namespace: 'users',
      state: ['foo'],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
    });
    app.start();

    const oldCount = app._models.length;

    app.replaceModel({
      namespace: 'users',
      state: ['bar'],
      reducers: {
        add(state, { payload }) {
          return [...state, 'world', payload];
        },
        clear() {
          return [];
        },
      },
    });

    expect(app._models.length).toEqual(oldCount);
    let state = app._store.getState();
    expect(state.users).toEqual(['foo']);

    app._store.dispatch({ type: 'users/add', payload: 'jack' });
    state = app._store.getState();
    expect(state.users).toEqual(['foo', 'world', 'jack']);

    // test new added action
    app._store.dispatch({ type: 'users/clear' });

    state = app._store.getState();
    expect(state.users).toEqual([]);
  });

  it('should run new effects if model exists', () => {
    const app = create();
    app.model({
      namespace: 'users',
      state: [],
      reducers: {
        setter(state, { payload }) {
          return [...state, payload];
        },
      },
      effects: {
        *add({ payload }, { put }) {
          yield put({
            type: 'setter',
            payload,
          });
        },
      },
    });
    app.start();

    app.replaceModel({
      namespace: 'users',
      state: [],
      reducers: {
        setter(state, { payload }) {
          return [...state, payload];
        },
      },
      effects: {
        *add(_, { put }) {
          yield put({
            type: 'setter',
            payload: 'mock',
          });
        },
      },
    });

    app._store.dispatch({ type: 'users/add', payload: 'jack' });
    const state = app._store.getState();
    expect(state.users).toEqual(['mock']);
  });

  it('should run subscriptions after replaceModel', () => {
    const app = create();
    app.model({
      namespace: 'users',
      state: [],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
      subscriptions: {
        setup({ dispatch }) {
          // should return unlistener but omitted here
          dispatch({ type: 'add', payload: 1 });
        },
      },
    });
    app.start();

    app.replaceModel({
      namespace: 'users',
      state: [],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
      subscriptions: {
        setup({ dispatch }) {
          // should return unlistener but omitted here
          dispatch({ type: 'add', payload: 2 });
        },
      },
    });

    const state = app._store.getState();
    // This should be an issue but can't be avoided with dva
    // To avoid, in client code, setup method should be idempotent when running multiple times
    expect(state.users).toEqual([1, 2]);
  });

  it('should remove old subscription listeners after replaceModel', () => {
    const app = create();
    const emitter = new EventEmitter();
    let emitterCount = 0;

    app.model({
      namespace: 'users',
      state: [],
      subscriptions: {
        setup() {
          emitter.on('event', () => {
            emitterCount += 1;
          });
          return () => {
            emitter.removeAllListeners();
          };
        },
      },
    });
    app.start();

    emitter.emit('event');

    app.replaceModel({
      namespace: 'users',
      state: [],
    });

    emitter.emit('event');

    expect(emitterCount).toEqual(1);
  });

  it('should trigger onError if error is thown after replaceModel', () => {
    let triggeredError = false;
    const app = create({
      onError() {
        triggeredError = true;
      },
    });
    app.model({
      namespace: 'users',
      state: [],
    });
    app.start();

    app.replaceModel({
      namespace: 'users',
      state: [],
      effects: {
        *add() {
          yield 'fake';

          throw new Error('fake error');
        },
      },
    });

    app._store.dispatch({
      type: 'users/add',
    });

    expect(triggeredError).toEqual(true);
  });
});
