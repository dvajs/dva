import expect from 'expect';
import React from 'react';
import dva from '../src/index';
import dvaM from '../src/mobile';

describe('app.model', () => {

  it('namespace: type error', () => {
    const app = dva();
    expect(_ => {
      app.model({});
    }).toThrow(/app.model: namespace should be defined/);
    expect(_ => {
      app.model({
        namespace: 'routing',
      });
    }).toThrow(/app.model: namespace should not be routing/);

    const appM = dvaM();
    expect(_ => {
      appM.model({
        namespace: 'routing',
      });
    }).toNotThrow();
  });

  it('namespace: unique error', () => {
    const app = dva();
     expect(_ => {
      app.model({
        namespace: 'repeat'
      });
      app.model({
        namespace: 'repeat'
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
        'add'(state, { payload }) {
          return [...state, payload];
        },
      },
    });
    app.router(_ => <div />);
    app.start();

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
      subscriptions: {
        setup() {
          count = count + 1;
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
    let count = 0;

    const model = {
      namespace: 'count',
      state: 0,
      subscriptions: {
        setup() {
          count += 1;
        },
      },
    };

    app.model(model);
    app.router(() => 1);
    app.start();
    expect(_ => {
      app.model(model);
    }).toThrow(/app.model: namespace should be unique/);
  });
  
});
