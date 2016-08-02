import { is, check, warn } from './utils';

export const hooks = {
  onError: [],
  onStateChange: [],
  onAction: [],
  onHmr: [],
  extraReducers: [],
  onReducer: [],
};

export function use(plugin) {
  check(plugin, is.object, 'Plugin must be plain object.');
  for (const key in plugin) {
    if (plugin.hasOwnProperty(key)) {
      check(key, key => key in hooks, `Unknown plugin property: ${key}.`);
      hooks[key].push(plugin[key]);
    }
  }
}

export function apply(key, defaultHandler) {
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

export function get(key) {
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
