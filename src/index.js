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

  function checkModel(model) {
    check(model.namespace, is.notUndef, 'Namespace must be defined with model.');
    check(model.namespace, namespace => namespace !== 'routing', 'Namespace should not be routing.');
  }

  function model(model) {
    checkModel(model);
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
    _models.forEach(({ reducers:_reducers, state, namespace, effects }) => {
      reducers[namespace] = getReducer(_reducers, state);
      sagas = {...sagas, ...effects};
    });

    function getReducer(reducers, state) {
      if (is.array(reducers)) {
        const [ _reducers, enhancer ] = reducers;
        return enhancer(handleActions(_reducers || {}, state));
      } else {
        return handleActions(reducers || {}, state);
      }
    }

    // Support external reducers.
    const extraReducers = plugin.get('extraReducers');
    check(extraReducers, extraReducers => {
      for (let k in extraReducers) {
        if (k in reducers) return false;
      }
      return true;
    }, 'extraReducers should not be conflict with namespace in model.');

    const _history = opts.history || hashHistory;

    // Create store.
    const extraMiddlewares = plugin.get('onAction');
    const reducerEnhancer = plugin.get('onReducer');
    const sagaMiddleware = createSagaMiddleware();
    const devtools = window.devToolsExtension || (() => noop => noop);
    const middlewares = [
      routerMiddleware(_history),
      sagaMiddleware,
      ...(extraMiddlewares || []),
    ];
    const enhancers = [
      applyMiddleware(...middlewares),
      devtools(),
    ];
    const initialState = opts.initialState || {};
    const store = app.store = createStore(
      createReducer(),
      initialState,
      compose(...enhancers)
    );

    function createReducer(asyncReducers) {
      return reducerEnhancer(combineReducers({
        ...reducers,
        ...extraReducers,
        ...asyncReducers,
      }));
    }

    store.asyncReducers = {};

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
    const subs = _models.reduce((ret, model) => {
      if (model.subscriptions) {
        check(model.subscriptions, is.array, 'Subscriptions must be an array');
        ret = [...ret, ...model.subscriptions];
      }
      return ret;
    }, []);
    runSubscriptions(subs);

    app.model = injectModel;

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

    function runSubscriptions(subs) {
      for (const sub of subs) {
        check(sub, is.func, 'Subscription must be an function');
        sub({dispatch: store.dispatch, history}, onErrorWrapper);
      }
    }

    function injectModel(model) {
      checkModel(model);

      // inject reducers
      store.asyncReducers[model.namespace] = getReducer(model.reducers, model.state);
      store.replaceReducer(createReducer(store.asyncReducers));

      // inject effects

      // run subscriptions
      if (model.subscriptions) {
        runSubscriptions(model.subscriptions);
      }
    }
  }
}

export default dva;
