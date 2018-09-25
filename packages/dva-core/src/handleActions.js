import invariant from 'invariant';

export default function handleActions(handlers, defaultState) {
  return (state = defaultState, action) => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    const reducer = handlers[type];
    if (reducer) {
      return reducer(state, action);
    }
    return state;
  };
}
