import expect from 'expect';
import { create } from '../src/index';
import { ACTIONS_NAME } from '../src/constants';

describe('check actions', () => {
  it('combineReducer', () => {
    const app = create();
    app.model({
      state: { count: 0 },
      namespace: 'n1',
      reducers: {
        r1: (state, action) => ({ count: action.payload }),
        r2: (state, action) => ({ count: -action.payload }),
      },
    })
    expect(app.actions.n1.combineReducer).toBeA(Function)
    app.start()
    expect(app.actions.n1.combineReducer({
      r1: 1,
      r2: 2
    })).toEqual({
      type: ACTIONS_NAME,
      payload: {
        'n1/r1': {
          type: 'n1/r1',
          payload: 1
        },
        'n1/r2': {
          type: 'n1/r2',
          payload: 2
        },
      }
    })
    expect(app._store.getState().n1).toEqual({ count: -2 })
  });

  it('reducer', () => {
    const app = create();
    app.model({
      state: { count: 0 },
      namespace: 'n1',
      reducers: {
        r1: (state, action) => ({ count: action.payload }),
      },
    })
    app.start()
    expect(app.actions.n1.r1(1)).toEqual({ type: 'n1/r1', payload: 1 })
    expect(app._store.getState().n1).toEqual({ count: 1 })
  });

  it('effect', () => {
    const app = create();
    app.model({
      namespace: 'n1',
      state: { count: 0 },
      reducers: {
        r1: (state, action) => ({ count: action.payload }),
      },
      effects: {
        *e1(action, { put }){
          yield put({
            type: 'r1',
            payload: action.payload
          })
        },
      },
    })
    app.start()
    expect(app.actions.n1.e1(1)).toBeA(Promise)
    expect(app._store.getState().n1).toEqual({ count: 1 })
  });
});
