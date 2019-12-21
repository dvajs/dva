import { NAMESPACE_SEP } from './constants';

export default function prefixType(type, model) {
  const prefixedType = `${model.namespace}${NAMESPACE_SEP}${type}`;
  const typeWithoutAffix = prefixedType.replace(/\/@@[^/]+?$/, '');

  const reducer = Array.isArray(model.reducers)
    ? model.reducers[0][typeWithoutAffix]
    : model.reducers && model.reducers[typeWithoutAffix];
  if (reducer || (model.effects && model.effects[typeWithoutAffix])) {
    return prefixedType;
  }
  return type;
}
