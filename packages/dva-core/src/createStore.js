import { createStore, applyMiddleware, compose } from 'redux';
import flatten from 'flatten';
import invariant from 'invariant';
import window from 'global/window';
import { returnSelf, isArray } from './utils';

export default function({
  reducers,
  initialState,
  plugin,
  sagaMiddleware,
  promiseMiddleware,
  createOpts: { setupMiddlewares = returnSelf },
}) {
  // extra enhancers
  const extraEnhancers = plugin.get('extraEnhancers');
  invariant(
    isArray(extraEnhancers),
    `[app.start] extraEnhancers should be array, but got ${typeof extraEnhancers}`
  );

  const extraMiddlewares = plugin.get('onAction');
  const middlewares = setupMiddlewares([
    promiseMiddleware,
    sagaMiddleware,
    ...flatten(extraMiddlewares),
  ]);

  let devtools = () => noop => noop;
  if (
    process.env.NODE_ENV !== 'production' &&
    window.__REDUX_DEVTOOLS_EXTENSION__
  ) {
    devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
  }

  const enhancers = [
    applyMiddleware(...middlewares),
    ...extraEnhancers,
    devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS),
  ];

  return createStore(reducers, initialState, compose(...enhancers));
}
