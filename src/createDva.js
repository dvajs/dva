import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware, { takeEvery, takeLatest } from 'redux-saga';
import { handleActions } from 'redux-actions';
import { fork } from 'redux-saga/effects';
import isPlainObject from 'is-plain-object';
import assert from 'assert';
import Plugin from './plugin';

export default function createDva(createOpts) {
  const {
    mobile,
    initialReducer,
    defaultHistory,
    routerMiddleware,
    setupHistory,
  } = createOpts;

  return function dva(hooks = {}) {
    const plugin = new Plugin();
    plugin.use(hooks);

    const app = {
      // properties
      _models: [],
      _router: null,
      _store: null,
      _history: null,
      _plugin: plugin,
      // methods
      use: plugin.use.bind(plugin),
      model,
      router,
      start,
    };
    return app;

    ////////////////////////////////////
    // Methods

    function model(m) {
      checkModel(m, mobile);
      this._models.push(m);
    }

    // inject model dynamically
    function injectModel(createReducer, onError, m) {
      checkModel(m, mobile);
      const store = this._store;

      // reducers
      store.asyncReducers[m.namespace] = getReducer(m.reducers, m.state);
      store.replaceReducer(createReducer(store.asyncReducers));
      // effects
      if (m.effects) {
        store.runSaga(getSaga(m.effects));
      }
      // subscriptions
      if (m.subscriptions) {
        runSubscriptions(m.subscriptions, this, onError);
      }
    }

    function router(router) {
      assert.equal(typeof router, 'function', 'app.router: router should be function');
      this._router = router;
    }

    function start(container, opts = {}) {
      // support: app.start(opts);
      if (isPlainObject(container)) {
        opts = container;
        container = null;
      }

      // support selector
      if (typeof container === 'string') {
        container = document.querySelector(container);
        assert.ok(container, 'app.start: could not query selector: ' + container);
      }

      assert.ok(!container || isHTMLElement(container), 'app.start: container should be HTMLElement');
      assert.ok(this._router, 'app.start: router should be defined');

      // set history
      const history = opts.history || defaultHistory;

      // error wrapper
      const onError = plugin.apply('onError', function(err) {
        throw new Error(err.stack || err);
      });
      const onErrorWrapper = (err) => {
        if (err) {
          if (typeof err === 'string') err = new Error(err);
          onError(err);
        }
      };

      // get reducers and sagas from model
      let sagas = [];
      let reducers = { ...initialReducer };
      for (const m of this._models) {
        reducers[m.namespace] = getReducer(m.reducers, m.state);
        if (m.effects) sagas.push(getSaga(m.effects, onErrorWrapper));
      }

      // extra reducers
      const extraReducers = plugin.get('extraReducers');
      assert.ok(Object.keys(extraReducers).every(key => !(key in reducers)), 'app.start: extraReducers is conflict with other reducers');

      // create store
      const extraMiddlewares = plugin.get('onAction');
      const reducerEnhancer = plugin.get('onReducer');
      const sagaMiddleware = createSagaMiddleware();
      let middlewares = [
        sagaMiddleware,
        ...extraMiddlewares,
      ];
      if (routerMiddleware) {
        middlewares = [routerMiddleware(history), ...middlewares];
      }
      const devtools = window.devToolsExtension || (() => noop => noop);
      const enhancers = [
        applyMiddleware(...middlewares),
        devtools(),
      ];
      const store = this._store = createStore(
        createReducer(),
        opts.initialState || {},
        compose(...enhancers)
      );

      function createReducer(asyncReducers) {
        return reducerEnhancer(combineReducers({
          ...reducers,
          ...extraReducers,
          ...asyncReducers,
        }));
      }

      // extend store
      store.runSaga = sagaMiddleware.run;
      store.asyncReducers = {};

      // store change
      const listeners = plugin.get('onStateChange');
      for (const listener of listeners) {
        store.subscribe(listener);
      }

      // start saga
      sagas.forEach(sagaMiddleware.run);

      // setup history
      if (setupHistory) setupHistory.call(this, history);

      // run subscriptions
      const subs = this._models.reduce((ret, { subscriptions }) => {
        return [ ...ret, ...(subscriptions || [])];
      }, []);
      runSubscriptions(subs, this, onErrorWrapper);

      // inject model after start
      this.model = injectModel.bind(this, createReducer, onErrorWrapper);

      // If has container, render; else, return react component
      if (container) {
        render(container, store, this, this._router);
        plugin.apply('onHmr')(render.bind(this, container, store, this));
      } else {
        return getProvider(store, this, this._router);
      }
    }

    ////////////////////////////////////
    // Helpers

    function getProvider(store, app, router) {
      return () => (
        <Provider store={store}>
          { router({ app, history: app._history, }) }
        </Provider>
      );
    }

    function render(container, store, app, router) {
      ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
    }

    function checkModel(model, mobile) {
      assert.ok(model.namespace, 'app.model: namespace should be defined');
      assert.ok(mobile || model.namespace !== 'routing', 'app.model: namespace should not be routing, it\'s used by react-redux-router');
      assert.ok(!model.subscriptions || Array.isArray(model.subscriptions), 'app.model: subscriptions should be Array');
      assert.ok(!model.reducers || typeof model.reducers === 'object' || Array.isArray(model.reducers), 'app.model: reducers should be Object or array');
      assert.ok(!Array.isArray(model.reducers) || (typeof model.reducers[0] === 'object' && typeof model.reducers[1] === 'function'), 'app.model: reducers with array should be app.model({ reducers: [object, function] })')
      assert.ok(!model.effects || typeof model.effects === 'object', 'app.model: effects should be Object');
    }

    function isHTMLElement(node) {
      return typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
    }

    function getReducer(reducers, state) {
      if (Array.isArray(reducers)) {
        return reducers[1](handleActions(reducers[0], state));
      } else {
        return handleActions(reducers || {}, state);
      }
    }

    function getSaga(effects, onError) {
      return function *() {
        for (const key in effects) {
          const watcher = getWatcher(key, effects[key], onError);
          yield fork(watcher);
        }
      }
    }

    function getWatcher(key, _effect, onError) {
      let effect = _effect;
      let type = 'takeEvery';
      if (Array.isArray(_effect)) {
        effect = _effect[0];
        const opts = _effect[1];
        if (opts && opts.type) {
          type = opts.type;
        }
        assert.ok(['watcher', 'takeEvery', 'takeLatest'].indexOf(type) > -1, 'app.start: effect type should be takeEvery, takeLatest or watcher')
      }

      function *sagaWithCatch(...args) {
        try {
          yield effect(...args);
        } catch(e) {
          onError(e);
        }
      }

      switch (type) {
        case 'watcher':
          return sagaWithCatch;
        case 'takeEvery':
          return function*() {
            yield takeEvery(key, sagaWithCatch);
          };
        case 'takeLatest':
          return function*() {
            yield takeLatest(key, sagaWithCatch);
          };
        default:
          throw new Error(`app.start: unsupport effect type ${type}`);
      }
    }

    function runSubscriptions(subs, app, onError) {
      for (const sub of subs) {
        assert.ok(typeof sub === 'function', 'app.start: subscription should be function');
        sub({ dispatch: app._store.dispatch, history:app._history }, onError);
      }
    }

  };
}
