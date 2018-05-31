import dva from 'dva';
import userImmer from '../src/index';

describe('dva-immer', () => {
  it('normal', () => {
    const app = dva();
    app.use(userImmer());

    app.model({
      namespace: 'count',
      state: {
        a: {
          b: {
            c: 0,
          },
        },
      },
      reducers: {
        add(state) {
          state.a.b.c += 1;
        },
      },
    });
    app.router(() => 1);
    app.start();

    const oldCount = app._store.getState().count;
    app._store.dispatch({ type: 'count/add' });
    const newCount = app._store.getState().count;
    expect(oldCount.a.b.c).toEqual(0);
    expect(newCount.a.b.c).toEqual(1);
  });
});
