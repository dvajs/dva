import { NAMESPACE_SEP } from './constants';

export default function createPromiseMiddleware(app) {
  const map = {};

  const middleware = () => next => (action) => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
        map[type] = {
          resolve: wrapped.bind(null, type, resolve),
          reject: wrapped.bind(null, type, reject),
        };
      });
    } else {
      return next(action);
    }
  };

  function isEffect(type) {
    const [namespace] = type.split(NAMESPACE_SEP);
    const model = app._models.filter(m => m.namespace === namespace)[0];
    if (model) {
      if (model.effects && model.effects[type]) {
        return true;
      }
    }

    return false;
  }

  function wrapped(type, fn, args) {
    if (map[type]) delete map[type];
    fn(args);
  }

  function resolve(type, args) {
    if (map[type]) {
      map[type].resolve(args);
    }
  }

  function reject(type, args) {
    if (map[type]) {
      map[type].reject(args);
    }
  }

  return {
    middleware,
    resolve,
    reject,
  };
}
