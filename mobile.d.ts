import dva from './index';

export default dva;

/**
 * Connects a React component to Dva.
 */
export function connect(
  mapStateToProps?: Function,
  mapDispatchToProps?: Function,
  mergeProps?: Function,
  options?: Object
): Function;
