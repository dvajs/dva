import { id } from './index'
import { ACTIONS_NAME } from './constants'

function identify(value) {
  return value;
}

function handleAction(actionType, reducer = identify) {
  return (state, action) => {
    if (action.type === ACTIONS_NAME) {
      action = action.payload[actionType] || {}
    }
    const { type, payload } = action;
    if (actionType !== type) {
      return state;
    }
    return reducer(state, action);
  };
}

function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce(
      (p, r) => r(p, current),
      previous,
    );
}

function handleActions(handlers, defaultState) {
  const reducers = Object.keys(handlers).map(type => handleAction(type, handlers[type]));
  const reducer = reduceReducers(...reducers);
  return (state = defaultState, action) => reducer(state, action);
}

export default handleActions;
