import defaultHandleActions from './handleActions';

export default function getReducer(reducers, state, handleActions) {
  // Support reducer enhancer
  // e.g. reducers: [realReducers, enhancer]
  if (Array.isArray(reducers)) {
    return reducers[1](
      (handleActions || defaultHandleActions)(reducers[0], state)
    );
  } else {
    return (handleActions || defaultHandleActions)(reducers || {}, state);
  }
}
