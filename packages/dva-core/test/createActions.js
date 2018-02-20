import expect from 'expect';
import { create, namespaceId } from '../src/index';

describe('check actions', () => {
  it('reducer action should support chain', () => {
    const app = create();
    app.model({
      state: {},
      namespace: 'n1',
      reducers: {
        r1: state => state,
        r2: state => state,
      },
    })
    const actionMap = app.actions.n1.r1().r2(2)
    expect(actionMap.r1).toBeA(Function)
    expect(actionMap.r2).toBeA(Function)
    expect(actionMap.actions).toEqual({
      'n1/r1': {
        type: 'n1/r1',
      },
      'n1/r2': {
        type: 'n1/r2',
        payload: 2
      },
    })
    app.start()
    app._store.dispatch(actionMap)
    expect(actionMap.actions).toEqual({})
  });

  it('chain reducer call order by definition', () => {
    const app = create();
    app.model({
      state: { count: 0 },
      namespace: 'n1',
      reducers: {
        r1(state, action) {
          return { ...state, count: action.payload }
        },
        r2(state, action) {
          return { ...state, count: action.payload }
        }
      },
    })
    const actionMap = app.actions.n1.r1(1).r2(2)
    app.start()
    app._store.dispatch(actionMap)
    expect(app._store.getState().n1).toEqual({ count: 2 })
  });

  it('effect action should not support chain', () => {
    const app = create();
    app.model({
      namespace: 'n1',
      effects: {
        *e1(){},
      },
    })
    expect(app.actions.n1.e1()).toEqual({ type: 'n1/e1' })
    expect(app.actions.n1.e1(1)).toEqual({ type: 'n1/e1', payload: 1 })
  });
});
