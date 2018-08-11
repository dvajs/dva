import warning from 'warning';
import { isPlainObject, isFunction } from './utils';
import prefixedDispatch from './prefixedDispatch';

export function run(subs, model, app, onError) {
  const funcs = [];
  const nonFuncs = [];
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      const subs = isPlainObject(app._subscriptions) ? app._subscriptions : {}
      const listeners = Object.assign({
        dispatch: prefixedDispatch(app._store.dispatch, model),
        history: app._history,
      }, subs)
      const unlistener = sub(listeners), onError);
      if (isFunction(unlistener)) {
        funcs.push(unlistener);
      } else {
        nonFuncs.push(key);
      }
    }
  }
  return { funcs, nonFuncs };
}

export function unlisten(unlisteners, namespace) {
  if (!unlisteners[namespace]) return;

  const { funcs, nonFuncs } = unlisteners[namespace];
  warning(
    nonFuncs.length === 0,
    `[app.unmodel] subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`,
  );
  for (const unlistener of funcs) {
    unlistener();
  }
  delete unlisteners[namespace];
}
