import expect from 'expect';
import { create } from '../src/index';

describe('reducers', () => {
  it('enhancer', () => {
    function enhancer(reducer) {
      return (state, action) => {
        if (action.type === 'square') {
          return state * state;
        }
        return reducer(state, action);
      };
    }

    const app = create();
    app.model({
      namespace: 'count',
      state: 3,
      reducers: [
        {
          add(state, { payload }) {
            return state + (payload || 1);
          },
        },
        enhancer,
      ],
    });
    app.start();

    app._store.dispatch({ type: 'square' });
    app._store.dispatch({ type: 'count/add' });
    expect(app._store.getState().count).toEqual(10);
  });

  it('extraReducers', () => {
    const reducers = {
      count: (state, { type }) => {
        if (type === 'add') {
          return state + 1;
        }
        // default state
        return 0;
      },
    };
    const app = create({
      extraReducers: reducers,
    });
    app.start();

    expect(app._store.getState().count).toEqual(0);
    app._store.dispatch({ type: 'add' });
    expect(app._store.getState().count).toEqual(1);
  });

  // core 没有 routing 这个 reducer，所以用例无效了
  xit('extraReducers: throw error if conflicts', () => {
    const app = create({
      extraReducers: { routing() {} },
    });
    expect(() => {
      app.start();
    }).toThrow(/\[app\.start\] extraReducers is conflict with other reducers/);
  });

  it('onReducer with saveAndLoad', () => {
    let savedState = null;
    const saveAndLoad = r => (state, action) => {
      const newState = r(state, action);
      if (action.type === 'save') {
        savedState = newState;
      }
      if (action.type === 'load') {
        return savedState;
      }
      return newState;
    };
    const app = create({
      onReducer: saveAndLoad,
    });
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state) {
          return state + 1;
        },
      },
    });
    app.start();

    app._store.dispatch({ type: 'count/add' });
    expect(app._store.getState().count).toEqual(1);
    app._store.dispatch({ type: 'save' });
    expect(app._store.getState().count).toEqual(1);
    app._store.dispatch({ type: 'count/add' });
    app._store.dispatch({ type: 'count/add' });
    expect(app._store.getState().count).toEqual(3);
    app._store.dispatch({ type: 'load' });
    expect(app._store.getState().count).toEqual(1);
  });

  it('onReducer', () => {
    const undo = r => (state, action) => {
      const newState = r(state, action);
      return { present: newState, routing: newState.routing };
    };
    const app = create({
      onReducer: undo,
    });
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        update(state) {
          return state + 1;
        },
      },
    });
    app.start();

    expect(app._store.getState().present.count).toEqual(0);
  });
});
