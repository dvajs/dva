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
      // 需要复制一份，不能直接修改 model.reducers[0], 会导致微前端场景下，重复添加前缀
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
