import warning from 'warning';
import { isArray, deepClone } from './utils';
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
  const dvamodel = deepClone(model);
  const {
    namespace,
    reducers,
    effects,
  } = dvamodel;

  if (reducers) {
    if (isArray(reducers)) {
      dvamodel.reducers[0] = prefix(reducers[0], namespace, 'reducer');
    } else {
      dvamodel.reducers = prefix(reducers, namespace, 'reducer');
    }
  }
  if (effects) {
    dvamodel.effects = prefix(effects, namespace, 'effect');
  }
  return dvamodel;
}
