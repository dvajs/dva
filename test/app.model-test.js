import expect from 'expect';
import dva from '../src/index';

describe('app.model', () => {
  it('reducer enhancer', () => {
    function enhancer(reducer) {
      return (state, action) => {
        if (action.type === 'square') {
          return state * state;
        }
        return reducer(state, action);
      };
    }

    const app = dva();
    app.model({
      namespace: 'count',
      state: 3,
      reducers: [{
        ['add'](state) {
          console.log('reducer: add');
          return state + 1;
        },
      }, enhancer],
    });
    app.router(({history}) => <div />);
    app.start();

    app.store.dispatch({ type: 'square' });
    app.store.dispatch({ type: 'add' });
    expect(app.store.getState().count).toEqual(10);
  });
});
