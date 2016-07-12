import expect from 'expect';
import dva from '../src/index';

describe('basic', () => {
  it('basic', () => {
    let sagaCount = 0;

    const app = dva();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        ['add'](state) {
          return state + 1;
        },
      },
      effects: {
        ['add']: function*() {
          sagaCount = sagaCount + 1;
        },
      }
    });
    app.router(({history}) => <div />);
    app.start();

    app.store.dispatch({ type: 'add' });
    expect(app.store.getState().count).toEqual(1);
    expect(sagaCount).toEqual(1);
  });
});
