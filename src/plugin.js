import { is, check, warn } from './utils';

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
    check(plugin, is.object, 'Plugin must be plain object.');
    const hooks = this.hooks;
    for (const key in plugin) {
      if (plugin.hasOwnProperty(key)) {
        check(key, key => key in hooks, `Unknown plugin property: ${key}.`);
        hooks[key].push(plugin[key]);
      }
    }
  }

  apply(key, defaultHandler) {
    const hooks = this.hooks;
    const validApplyHooks = ['onError', 'onHmr'];
    check(key, key => validApplyHooks.indexOf(key) > -1, `Hook ${key} should not be applied.`);
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
    check(key, key => key in hooks, `Hook ${key} should not be got.`);
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
