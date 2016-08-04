import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware, { takeEvery, takeLatest } from 'redux-saga';
import { hashHistory, Router, match } from 'react-router';
import { routerMiddleware, syncHistoryWithStore, routerReducer as routing } from 'react-router-redux';
import { handleActions } from 'redux-actions';
import { fork } from 'redux-saga/effects';
import window from 'global/window';
import { is, check, warn } from './utils';
import Plugin from './plugin';

function dva(opts = {}) {
  const plugin = new Plugin();
  plugin.use(opts);

  let _routes = null;
  const _models = [];
  const app = {
    model,
    router,
    start,
    use: plugin.use.bind(plugin),
    store: null
  };
  return app;

  function model(model) {
    check(model.namespace, is.notUndef, 'Namespace must be defined with model.');
    check(model.namespace, namespace => namespace !== 'routing', 'Namespace should not be routing.');
    _models.push(model);
  }

  function router(routes) {
    check(routes, is.func, 'Routes must be function.');
    _routes = routes;
  }

  // Usage:
  // app.start();
  // app.start(container);
  // app.start(container, opts);
  // app.start(opts);
  function start(container, opts = {}) {
    // If no container supplied, return jsx element.
    if (arguments.length === 0
      || (arguments.length === 1 && is.object(container))) {
      opts = container || {};
      container = null;
    } else {
      check(container, is.element, 'Container must be DOMElement.');
    }
    check(_routes, is.notUndef, 'Routes is not defined.');

    // Handle onError.
    const onError = plugin.apply('onError', function(err) {
      throw new Error(err.stack || err);
    });
    const onErrorWrapper = (err) => {
      if (err) {
        if (is.string(err)) err = new Error(err);
        onError(err);
      }
    };

    // Get sagas and reducers from model.
    let sagas = {};
    let reducers = {
      routing
    };
    _models.forEach(model => {
      if (is.array(model.reducers)) {
        const [ _reducers, enhancer ] = model.reducers;
        reducers[model.namespace] = enhancer(handleActions(_reducers || {}, model.state));
      } else {
        reducers[model.namespace] = handleActions(model.reducers || {}, model.state);
      }
      sagas = { ...sagas, ...model.effects };
    });

    // Support external reducers.
    const extraReducers = plugin.get('extraReducers');
    check(extraReducers, extraReducers => {
      for (let k in extraReducers) {
        if (k in reducers) return false;
      }
      return true;
    }, 'extraReducers should not be conflict with namespace in model.');
    reducers = { ...reducers, ...extraReducers };

    const _history = opts.history || hashHistory;

    // Create store.
    const extraMiddlewares = plugin.get('onAction');
    const reducerEnhancer = plugin.get('onReducer');
    const sagaMiddleware = createSagaMiddleware();
    const enhancer = compose(
      applyMiddleware.apply(null, [ routerMiddleware(_history), sagaMiddleware, ...(extraMiddlewares || []) ]),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const initialState = opts.initialState || {};
    const store = app.store = createStore(
      reducerEnhancer(combineReducers(reducers)), initialState, enhancer
    );

    // Handle onStateChange.
    const listeners = plugin.get('onStateChange');
    for (const listener of listeners) {
      store.subscribe(listener);
    }

    // Start saga.
    sagaMiddleware.run(rootSaga);

    // Sync history.
    // Use try catch because it don't work in test.
    let history;
    try {
      history = syncHistoryWithStore(_history, store);

      const oldHistoryListen = history.listen;
      const routes = _routes({history});
      history.listen = callback => {
        oldHistoryListen.call(history, location => {
          match({location, routes}, (error, _, state) => {
            if (error) throw new Error(error);
            callback(location, state);
          });
        });
      };
    } catch (e) { /*eslint-disable no-empty*/ }

    // Handle subscriptions.
    _models.forEach(({ subscriptions }) => {
      if (subscriptions) {
        check(subscriptions, is.array, 'Subscriptions must be an array');
        subscriptions.forEach(sub => {
          check(sub, is.func, 'Subscription must be an function');
          sub({dispatch: store.dispatch, history}, onErrorWrapper);
        });
      }
    });

    // Render and hmr.
    if (container) {
      render();
      plugin.apply('onHmr')(render);
    } else {
      const Routes = _routes;
      return () => (
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      );
    }

    function getWatcher(k, saga) {
      let _saga = saga;
      let _type = 'takeEvery';
      if (Array.isArray(saga)) {
        [ _saga, opts ] = saga;
        opts = opts || {};
        check(opts.type, is.sagaType, 'Type must be takeEvery, takeLatest or watcher');
        warn(opts.type, v => v !== 'takeEvery', 'takeEvery is the default type, no need to set it by opts');
        _type = opts.type;
      }

      function* sagaWithErrorCatch(...arg) {
        try {
          yield _saga(...arg);
        } catch (e) {
          onError(e);
        }
      }

      if (_type === 'watcher') {
        return sagaWithErrorCatch;
      } else if (_type === 'takeEvery') {
        return function*() {
          yield takeEvery(k, sagaWithErrorCatch);
        };
      } else {
        return function*() {
          yield takeLatest(k, sagaWithErrorCatch);
        };
      }
    }

    function* rootSaga() {
      for (let k in sagas) {
        if (sagas.hasOwnProperty(k)) {
          const watcher = getWatcher(k, sagas[k]);
          yield fork(watcher);
        }
      }
    }

    function render(routes) {
      const Routes = routes || _routes;
      ReactDOM.render((
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      ), container);
    }
  }
}

export default dva;
