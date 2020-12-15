import warning from 'warning';
import { isArray } from './utils';
import { NAMESPACE_SEP } from './constants';

function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    warning(
      key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`,
    );
    const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

export default function prefixNamespace(model) {
  const { namespace, reducers, effects } = model;

  if (reducers) {
    if (isArray(reducers)) {
      const [reducer, ...rest] = reducers;
      model.reducers = [prefix(reducer, namespace, 'reducer'), ...rest];
    } else {
      model.reducers = prefix(reducers, namespace, 'reducer');
    }
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  return model;
}
