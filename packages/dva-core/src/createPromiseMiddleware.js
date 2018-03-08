import { NAMESPACE_SEP } from './constants';

export default function createPromiseMiddleware(app) {

  return () => next => (action) => {
    const { type } = action;
    if (isEffect(type)) {
      return Promise.race([
        new Promise((resolve, reject) => next({'@@resolve': resolve, '@@reject': reject, ...action})),
        new Promise((resolve, reject) => setTimeout(()=> reject('timeout'), 1000))
      ]);
    } else {
      return next(action);
    }
  };

  function isEffect(type) {
    if (!type || typeof type !== 'string') return false;
    const [namespace] = type.split(NAMESPACE_SEP);
    const model = app._models.filter(m => m.namespace === namespace)[0];
    if (model) {
      if (model.effects && model.effects[type]) {
        return true;
      }
    }

    return false;
  }

}
