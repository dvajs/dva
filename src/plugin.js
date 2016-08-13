import isPlainObject from 'is-plain-object';
import assert from 'assert';

class Plugin {

  constructor() {
    this.hooks = {
      onError: [],
      onStateChange: [],
      onAction: [],
      onHmr: [],
      extraReducers: [],
      onReducer: [],
    };
  }

  use(plugin) {
    assert.ok(isPlainObject(plugin), 'plugin.use: plugin should be plain object');
    const hooks = this.hooks;
    for (const key in plugin) {
      assert.ok(hooks[key], `plugin.use: unknown plugin property: ${key}`);
      hooks[key].push(plugin[key]);
    }
  }

  apply(key, defaultHandler) {
    const hooks = this.hooks;
    const validApplyHooks = ['onError', 'onHmr'];
    assert.ok(validApplyHooks.indexOf(key) > -1, `plugin.apply: hook ${key} cannot be applied`);
    const fns = hooks[key];

    return (...args) => {
      if (fns.length) {
        for (const fn of fns) {
          fn.apply(null, args);
        }
      } else if (defaultHandler) {
        defaultHandler.apply(null, args);
      }
    };
  }

  get(key) {
    const hooks = this.hooks;
    assert.ok(key in hooks, `plugin.get: hook ${key} cannot be got`);
    if (key === 'extraReducers') {
      let ret = {};
      for (const reducerObj of hooks[key]) {
        ret = { ...ret, ...reducerObj };
      }
      return ret;
    } else if (key === 'onReducer') {
      return function(reducer) {
        for (const reducerEnhancer of hooks[key]) {
          reducer = reducerEnhancer(reducer);
        }
        return reducer;
      }
    } else {
      return hooks[key];
    }
  }
}

export default Plugin;
