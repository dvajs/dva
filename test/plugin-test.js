import expect from 'expect';
import { use, apply, get, hooks } from '../src/plugin';

describe('plugin', () => {

  afterEach(() => {
    hooks.onError = [];
    hooks.onStateChange = [];
    hooks.onAction = [];
    hooks.onHmr = [];
    hooks.onReducer = [];
    hooks.extraReducers = [];
  });

  it('basic', () => {
    let hmrCount = 0;
    let errorMessage = '';

    function onError(err) {
      errorMessage = err.message;
    }

    use({
      onHmr: (x) => { hmrCount += 1 * x },
      onStateChange: 2,
      onAction: 1,
      extraReducers: { form: 1 },
      onReducer: (r) => { return (state, action) => { const res = r(state, action); return res + 1; } },
    });
    use({
      onHmr: (x) => { hmrCount += 2 + x },
      extraReducers: { user: 2 },
      onReducer: (r) => { return (state, action) => { const res = r(state, action); return res * 2; } },
    });

    apply('onHmr')(2);
    apply('onError', onError)({ message: 'hello dva' });

    expect(hmrCount).toEqual(6);
    expect(errorMessage).toEqual('hello dva');

    expect(get('extraReducers')).toEqual({ form: 1, user: 2});
    expect(get('onAction')).toEqual([1]);
    expect(get('onStateChange')).toEqual([2]);

    expect(get('onReducer')(state => state + 1)(0)).toEqual(4);
  });
});
