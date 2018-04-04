import { NAMESPACE_SEP } from "./constants";

export default function createPromiseMiddleware(app) {
  return () => next => action => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
        next({ resolve, reject, ...action });
      });
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
