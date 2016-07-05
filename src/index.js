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
  };
  return app;

  function model(model) {
    check(model.namespace, is.notUndef, 'Namespace must be defined with model');
    _models.push(model);
  }

  function router(routes) {
    check(routes, is.func, 'Routes must be function.');
    _routes = routes;
  }

  function start(rootId, opts = {}) {
    check(rootId, is.string, 'RootId must be string');
    check(_routes, is.notUndef, 'Routes is not defined');
    let sagas = {};
    const rootReducer = {};

    _models.forEach(model => {
      rootReducer[model.namespace] = handleActions(model.reducers || {}, model.state);
      sagas = { ...sagas, ...model.effects };
    });

    const sagaMiddleware = createSagaMiddleware();
    const enhancer = compose(
      applyMiddleware(sagaMiddleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const store = createStore(
      combineReducers({ ...rootReducer, routing }), {}, enhancer
    );
    const history = syncHistoryWithStore(opts.history || hashHistory, store);
    sagaMiddleware.run(rootSaga);

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
      ), document.getElementById(rootId));
    }

    render();
    return {
      render,
    };
  }
}

export default dva;
export { connect } from 'react-redux';
