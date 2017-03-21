import isPlainObject from 'is-plain-object';
import invariant from 'invariant';

class Plugin {

  constructor() {
    this.hooks = {
      onError: [],
      onStateChange: [],
      onAction: [],
      onHmr: [],
      onReducer: [],
      onEffect: [],
      extraReducers: [],
      extraEnhancers: [],
    };
  }

  use(plugin) {
    invariant(isPlainObject(plugin), 'plugin.use: plugin should be plain object');
    const hooks = this.hooks;
    for (const key in plugin) {
      if (Object.prototype.hasOwnProperty.call(plugin, key)) {
        invariant(hooks[key], `plugin.use: unknown plugin property: ${key}`);
        if (key === 'extraEnhancers') {
          hooks[key] = plugin[key];
        } else {
          hooks[key].push(plugin[key]);
        }
      }
    }
  }

  apply(key, defaultHandler) {
    const hooks = this.hooks;
    const validApplyHooks = ['onError', 'onHmr'];
    invariant(validApplyHooks.indexOf(key) > -1, `plugin.apply: hook ${key} cannot be applied`);
    const fns = hooks[key];

    return (...args) => {
      if (fns.length) {
        for (const fn of fns) {
          fn(...args);
        }
      } else if (defaultHandler) {
        defaultHandler(...args);
      }
    };
  }

  get(key) {
    const hooks = this.hooks;
    invariant(key in hooks, `plugin.get: hook ${key} cannot be got`);
    if (key === 'extraReducers') {
      let ret = {};
      for (const reducerObj of hooks[key]) {
        ret = { ...ret, ...reducerObj };
      }
      return ret;
    } else if (key === 'onReducer') {
      return function (reducer) {
        for (const reducerEnhancer of hooks[key]) {
          reducer = reducerEnhancer(reducer);
        }
        return reducer;
      };
    } else {
      return hooks[key];
    }
  }
}

export default Plugin;
