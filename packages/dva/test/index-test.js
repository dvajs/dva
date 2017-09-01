import expect from 'expect';
import React from 'react';
import dva from '../src/index';

const countModel = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) { return state + payload || 1; },
    minus(state, { payload }) { return state - payload || 1; },
  },
};

describe('index', () => {
  it('normal', () => {
    const app = dva();
    app.model({ ...countModel });
    app.router(() => <div />);
    app.start('#root');
  });

  it('start without container', () => {
    const app = dva();
    app.model({ ...countModel });
    app.router(() => <div />);
    app.start();
  });
});
