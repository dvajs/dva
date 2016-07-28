import expect from 'expect';
import dva from '../src/index';
import { hooks } from '../src/plugin';

describe('app.use', () => {

  afterEach(() => {
    hooks.onError = [];
    hooks.onStateChange = [];
    hooks.onAction = [];
    hooks.onHmr = [];
    hooks.extraReducers = [];
  });

  it('extraReducers', () => {
    const reducers = {
      count: (state, { type }) => {
        if (type === 'add') {
          return state + 1;
        }
        // default state
        return 0;
      }
    };
    const app = dva({
      extraReducers: reducers,
    });
    app.router(({ history }) => <div />);
    app.start();

    expect(app.store.getState().count).toEqual(0);
    app.store.dispatch({ type: 'add' });
    expect(app.store.getState().count).toEqual(1);
  });

  it('extraReducers: throw error if conflicts', () => {
    const app = dva({
      extraReducers: { routing: function () {} }
    });
    app.router(({ history }) => <div />);
    expect(() => {
      app.start();
    }).toThrow(/Reducers should not be conflict with namespace in model/);
  });

  it('onAction', () => {
    let count = 0;
    const countMiddleware = ({ dispatch, getState }) => next => action => {
      count = count + 1;
    };

    const app = dva({
      onAction: countMiddleware,
    });
    app.router(({ history }) => <div />);
    app.start();

    app.store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });
});
