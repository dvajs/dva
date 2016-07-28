import expect from 'expect';
import dva from '../src/index';

describe('app.start', () => {

  it('throw error if no routes defined', () => {
    const app = dva();
    expect(() => {
      app.start();
    }).toThrow(/Routes is not defined/);
  });

  it('opts.initialState', () => {
    const app = dva();
    app.model({
      namespace: 'count',
      state: 0
    });
    app.router(({ history }) => <div />);
    app.start({
      initialState: {
        count: 1
      }
    });
    expect(app.store.getState().count).toEqual(1);
  });

});
