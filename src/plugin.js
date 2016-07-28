import { is, check, warn } from './utils';

export const hooks = {
  onError: [],
  onStateChange: [],
  onAction: [],
  onHmr: [],
  extraReducers: [],
};

export function use(plugin) {
  check(plugin, is.object, 'Plugin must be plain object.');
  for (const k in plugin) {
    if (plugin.hasOwnProperty(k)) {
      check(k, k => k in hooks, `Unknown plugin property: ${k}.`);
      hooks[k].push(plugin[k]);
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
  }
}

export function get(key) {
  check(key, key => key in hooks, `Hook ${key} should not be got.`);
  if (key === 'extraReducers') {
    let ret = {};
    for (const reducerObj of hooks[key]) {
      ret = { ...ret, ...reducerObj };
    }
    return ret;
  } else {
    return hooks[key];
  }
}
