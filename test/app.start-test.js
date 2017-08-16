import React from 'react';
import expect from 'expect';
import dva from '../src/index';

describe('app.start', () => {
  it('throw error if no routes defined', () => {
    const app = dva();
    expect(() => {
      app.start();
    }).toThrow(/app.start: router should be defined/);
  });

  it('throw error if start with a invalid prop', () => {
    const app = dva();
    expect(() => {
      app.start('excited');
    }).toThrow(/app.start: could not query selector/);
  });

  it('start with a valid container', () => {
    const app = dva();
    expect(() => {
      app.router(() => <div />);
      // since document already inject to global in setup file
      // eslint-disable-next-line
      app.start(document.querySelector('#root'));
    }).toNotThrow();
  });
});
