import expect from 'expect';
import dva from '../src/index';

describe('app.start', () => {
  it('throw error if no routes defined', () => {
    const app = dva();
    expect(() => {
      app.start();
    }).toThrow(/app.start: router should be defined/);
  });
});
