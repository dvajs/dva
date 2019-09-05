import { createStore, applyMiddleware, compose } from 'redux';
import flatten from 'flatten';
import invariant from 'invariant';
import win from 'global/window';
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
    `[app.start] extraEnhancers should be array, but got ${typeof extraEnhancers}`,
  );

  const extraMiddlewares = plugin.get('onAction');
  const middlewares = setupMiddlewares([
    promiseMiddleware,
    sagaMiddleware,
    ...flatten(extraMiddlewares),
  ]);

  const composeEnhancers =
    process.env.NODE_ENV !== 'production' && win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, maxAge: 30 })
      : compose;

  const enhancers = [applyMiddleware(...middlewares), ...extraEnhancers];

  return createStore(reducers, initialState, composeEnhancers(...enhancers));
}
