import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware, { takeEvery, takeLatest } from 'redux-saga';
import { hashHistory, Router } from 'react-router';
import { syncHistoryWithStore, routerReducer as routing } from 'react-router-redux';
import { handleActions } from 'redux-actions';
import { fork } from 'redux-saga/effects';
import { is, check, warn } from './utils';

function dva() {
  let _routes = null;
  const _models = [];
  const app = {
    model,
    router,
    start,
    store: null,
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

  function start(container, opts = {}) {
    check(container, is.element, 'Container must be DOMElement.');
    check(_routes, is.notUndef, 'Routes is not defined.');

    // Get sagas and reducers from model.
    let sagas = {};
    let reducers = {
      routing,
    };
    _models.forEach(model => {
      reducers[model.namespace] = handleActions(model.reducers || {}, model.state);
      sagas = { ...sagas, ...model.effects };
    });

    // Support external reducers.
    if (opts.reducers) {
      check(opts.reducers, is.object, 'Reducers must be object.');
      check(opts.reducers, optReducers => {
        for (var k in optReducers) {
          if (k in reducers) return false;
        }
        return true;
      }, 'Reducers should not be conflict with namespace in model.');
      reducers = { ...reducers, ...opts.reducers };
    }

    // Create store.
    const sagaMiddleware = createSagaMiddleware();
    const enhancer = compose(
      applyMiddleware(sagaMiddleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const initialState = opts.initialState || {};
    const store = app.store = createStore(
      combineReducers(reducers), initialState, enhancer
    );

    // Sync history.
    const history = syncHistoryWithStore(opts.history || hashHistory, store);

    // Start saga.
    sagaMiddleware.run(rootSaga);

    // Handle subscriptions.
    document.addEventListener('DOMContentLoaded', () => {
      _models.forEach(({ subscriptions }) => {
        if (subscriptions) {
          check(subscriptions, is.array, 'Subscriptions must be an array');
          subscriptions.forEach(sub => {
            check(sub, is.func, 'Subscription must be an function');
            sub(store.dispatch);
          });
        }
      });
    });

    // Render and hmr.
    render();
    if (opts.hmr) {
      opts.hmr(render);
    }

    function getWatcher(k, saga) {
      let _saga = saga;
      let _type = 'takeEvery';
      if (Array.isArray(saga)) {
        [_saga, opts] = saga;
        opts = opts || {};
        check(opts.type, is.sagaType, 'Type must be takeEvery or takeLatest');
        warn(opts.type, v => v === 'takeLatest', 'takeEvery is the default type, no need to set it by opts');
        _type = opts.type;
      }

      if (_type === 'takeEvery') {
        return function*() {
          yield takeEvery(k, _saga);
        };
      } else {
        return function*() {
          yield takeLatest(k, _saga);
        };
      }
    }

    function* rootSaga() {
      for (var k in sagas) {
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
