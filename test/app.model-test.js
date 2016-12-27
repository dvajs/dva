import expect from 'expect';
import React from 'react';
import EventEmitter from 'events';
import dva from '../src/index';
import dvaM from '../src/mobile';

describe('app.model', () => {
  it('namespace: type error', () => {
    const app = dva();
    expect(() => {
      app.model({});
    }).toThrow(/app.model: namespace should be defined/);
    expect(() => {
      app.model({
        namespace: 'routing',
      });
    }).toThrow(/app.model: namespace should not be routing/);

    const appM = dvaM();
    expect(() => {
      appM.model({
        namespace: 'routing',
      });
    }).toNotThrow();
  });

  it('namespace: unique error', () => {
    const app = dva();
    expect(() => {
      app.model({
        namespace: 'repeat',
      });
      app.model({
        namespace: 'repeat',
      });
    }).toThrow(/app.model: namespace should be unique/);
  });

  it('dynamic model', () => {
    let count = 0;

    const app = dva();
    app.model({
      namespace: 'users',
      state: [],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
    });
    app.router(() => <div />);
    app.start();

    // inject model
    app.model({
      namespace: 'tasks',
      state: [],
      reducers: {
        add(state, { payload }) {
          return [...state, payload];
        },
      },
      effects: {
        *add() {
          yield 1;
          count += 1;
        },
      },
      subscriptions: {
        setup() {
          count += 1;
        },
      },
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

  it('don\'t inject if exists', () => {
    const app = dva();

    const model = {
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup() {},
      },
    };

    app.model(model);
    app.router(() => 1);
    app.start();
    expect(() => {
      app.model(model);
    }).toThrow(/app.model: namespace should be unique/);
  });

  it('support unmodel', () => {
    const emitter = new EventEmitter();
    let emitterCount = 0;

    const app = dva();
    app.model({
      namespace: 'a',
      state: 0,
      reducers: {
        add(state) { return state + 1; },
      },
    });
    app.model({
      namespace: 'b',
      state: 0,
      reducers: {
        add(state) { return state + 1; },
      },
      effects: {
        *addBoth(action, { put }) {
          yield put({ type: 'a/add' });
          yield put({ type: 'b/add' });
        },
      },
      subscriptions: {
        setup() {
          emitter.on('event', () => { emitterCount += 1; });
          return () => {
            emitter.removeAllListeners();
          };
        },
      },
    });
    app.router(() => 1);
    app.start();

    emitter.emit('event');
    app.unmodel('b');
    emitter.emit('event');

    app._store.dispatch({ type: 'b/addBoth' });

    const { a, b } = app._store.getState();
    expect(emitterCount).toEqual(1);
    expect({ a, b }).toEqual({ a: 0, b: undefined });
  });
});
