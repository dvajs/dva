import expect from 'expect';
import React from 'react';
import dva from '../src/index';

describe('app.start', () => {

  it('throw error if no routes defined', () => {
    const app = dva();
    expect(() => {
      app.start(document.getElementById('root'));
    }).toThrow(/Routes is not defined/);
  });

  it('opts.initialState', () => {
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0
    });
    app.router(({ history }) => <div />);
    app.start(document.getElementById('root'), {
      initialState: {
        count: 1
      }
    });
    expect(app.store.getState().count).toEqual(1);
  });

});
