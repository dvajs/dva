
function identify(value) {
  return value;
}

function handleAction(actionType, reducer = identify) {
  return (state, action) => {
    const { type } = action;
    if (type && actionType !== type) {
      return { state, end: false };
    }
    return { state: reducer(state, action), end: true };
  };
}

function reduceReducers(...reducers) {
  return (prevState, action) => {
    reducers.some((r) => {
      const { state, end } = r(prevState, action);
      prevState = state;
      return end;
    });
    return prevState;
  };
}

function handleActions(handlers, defaultState) {
  const reducers = Object.keys(handlers).map(type => handleAction(type, handlers[type]));
  const reducer = reduceReducers(...reducers);
  return (state = defaultState, action) => reducer(state, action);
}

export default handleActions;
