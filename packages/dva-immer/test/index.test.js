import dva from 'dva';
import userImmer from '../src/index';

describe('dva-immer', () => {
  xit('normal', () => {
    const app = dva.default();
    app.use(userImmer());

    app.model({
      namespace: 'count',
      state: {
        count: 111,
        text: 'hi',
      },
      reducers: {
        add(state) {
          state.count += 1;
        },
      },
    });
    app.router(() => 1);
    app.start();

    app._store.dispatch({ type: 'count/add' });
    console.log(app._store.getState().count);
  });
});
