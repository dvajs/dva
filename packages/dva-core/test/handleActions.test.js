import expect from 'expect';
import handleActions from '../src/handleActions';

describe('handleActions', () => {
  const LOGIN_START = 'user/login/start';

  const LOGIN_END = 'user/login/end';

  const LOGIN_SAVE = 'user/login/save';

  const initialState = {
    isLoading: false,
  };

  const reducers = handleActions(
    {
      [LOGIN_START](state) {
        return {
          ...state,
          isLoading: true,
        };
      },

      [LOGIN_END](state) {
        return {
          ...state,
          isLoading: false,
        };
      },

      [LOGIN_SAVE]: undefined,
    },
    initialState
  );

  it('LOGIN_START', () => {
    expect(reducers(initialState, { type: LOGIN_START })).toEqual({
      isLoading: true,
    });
  });

  it('LOGIN_END', () => {
    expect(reducers(initialState, { type: LOGIN_END })).toEqual({
      isLoading: false,
    });
  });

  it('uses the identity if the specified reducer is undefined', () => {
    expect(reducers(initialState, { type: LOGIN_SAVE })).toBe(initialState);
  });

  it('dispatch not valid action', () => {
    expect(() => {
      reducers(initialState, { type: '' });
    }).toThrow(/dispatch: action should be a plain Object with type/);
  });
});
