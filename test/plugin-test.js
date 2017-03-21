import expect from 'expect';
import Plugin from '../src/plugin';

describe('plugin', () => {
  it('basic', () => {
    let hmrCount = 0;
    let errorMessage = '';

    function onError(err) {
      errorMessage = err.message;
    }

    const plugin = new Plugin();

    plugin.use({
      onHmr: (x) => { hmrCount += 1 * x; },
      onStateChange: 2,
      onAction: 1,
      extraReducers: { form: 1 },
      onReducer: (r) => {
        return (state, action) => { const res = r(state, action); return res + 1; };
      },
    });
    plugin.use({
      onHmr: (x) => { hmrCount += 2 + x; },
      extraReducers: { user: 2 },
      onReducer: (r) => {
        return (state, action) => { const res = r(state, action); return res * 2; };
      },
    });

    plugin.apply('onHmr')(2);
    plugin.apply('onError', onError)({ message: 'hello dva' });

    expect(hmrCount).toEqual(6);
    expect(errorMessage).toEqual('hello dva');

    expect(plugin.get('extraReducers')).toEqual({ form: 1, user: 2 });
    expect(plugin.get('onAction')).toEqual([1]);
    expect(plugin.get('onStateChange')).toEqual([2]);

    expect(plugin.get('onReducer')(state => state + 1)(0)).toEqual(4);
  });
});
