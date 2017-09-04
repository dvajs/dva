import invariant from 'invariant';
import warning from 'warning';
import { NAMESPACE_SEP } from './constants';
import prefixType from './prefixType';

export default function prefixedDispatch(dispatch, model) {
  return (action) => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    warning(
      type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
      `dispatch: ${type} should not be prefixed with namespace ${model.namespace}`,
    );
    return dispatch({ ...action, type: prefixType(type, model) });
  };
}
