import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga/lib/internal/middleware';
import { takeEvery, takeLatest, throttle } from 'redux-saga/lib/internal/sagaHelpers';
import handleActions from 'redux-actions/lib/handleActions';
import * as sagaEffects from 'redux-saga/effects';
import isPlainObject from 'is-plain-object';
import invariant from 'invariant';
import warning from 'warning';
import flatten from 'flatten';
import window from 'global/window';
import Plugin from './plugin';

const SEP = '/';

export default function createDva(createOpts) {
  const {
    mobile,
    initialReducer,
    defaultHistory,
    routerMiddleware,
    setupHistory,
  } = createOpts;

  /**
   * Create a dva instance.
   */
  return function dva(hooks = {}) {
    // history and initialState does not pass to plugin
    const history = hooks.history || defaultHistory;
    const initialState = hooks.initialState || {};
    delete hooks.history;
    delete hooks.initialState;

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
      use,
      model,
      router,
      start,
    };
    return app;

    ////////////////////////////////////
    // Methods

    /**
     * Register an object of hooks on the application.
     *
     * @param hooks
     */
    function use(hooks) {
      plugin.use(hooks);
    }

    /**
     * Register a model.
     *
     * @param model
     */
    function model(model) {
      this._models.push(checkModel(model, mobile));
    }

    // inject model dynamically
    function injectModel(createReducer, onError, m) {
      if (m.namespace) {
        const hasExisted = this._models.some(model =>
          model.namespace === m.namespace
        );
        if (hasExisted) {
          return;
        }
      }
      m = checkModel(m, mobile);
      this._models.push(m);
      const store = this._store;

      // reducers
      store.asyncReducers[m.namespace] = getReducer(m.reducers, m.state);
      store.replaceReducer(createReducer(store.asyncReducers));
      // effects
      if (m.effects) {
        store.runSaga(getSaga(m.effects, m, onError));
      }
      // subscriptions
      if (m.subscriptions) {
        runSubscriptions(m.subscriptions, m, this, onError);
      }
    }

    /**
     * Config router. Takes a function with arguments { history, dispatch },
     * and expects router config. It use the same api as react-router,
     * return jsx elements or JavaScript Object for dynamic routing.
     *
     * @param router
     */
    function router(router) {
      invariant(typeof router === 'function', 'app.router: router should be function');
      this._router = router;
    }

    /**
     * Start the application. Selector is optional. If no selector
     * arguments, it will return a function that return JSX elements.
     *
     * @param container selector | HTMLElement
     */
    function start(container) {
      // support selector
      if (typeof container === 'string') {
        container = document.querySelector(container);
        invariant(container, 'app.start: could not query selector: ' + container);
      }

      invariant(!container || isHTMLElement(container), 'app.start: container should be HTMLElement');
      invariant(this._router, 'app.start: router should be defined');

      // error wrapper
      const onError = plugin.apply('onError', function(err) {
        throw new Error(err.stack || err);
      });
      const onErrorWrapper = (err) => {
        if (err) {
          if (typeof err === 'string') err = new Error(err);
          onError(err, app._store.dispatch);
        }
      };

      // get reducers and sagas from model
      let sagas = [];
      let reducers = { ...initialReducer };
      for (let m of this._models) {
        reducers[m.namespace] = getReducer(m.reducers, m.state);
        if (m.effects) sagas.push(getSaga(m.effects, m, onErrorWrapper));
      }

      // extra reducers
      const extraReducers = plugin.get('extraReducers');
      invariant(
        Object.keys(extraReducers).every(key => !(key in reducers)),
        'app.start: extraReducers is conflict with other reducers'
      );

      // create store
      const extraMiddlewares = plugin.get('onAction');
      const reducerEnhancer = plugin.get('onReducer');
      const sagaMiddleware = createSagaMiddleware();
      let middlewares = [
        sagaMiddleware,
        ...flatten(extraMiddlewares),
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

      // extend store
      store.runSaga = sagaMiddleware.run;
      store.asyncReducers = {};

      // store change
      const listeners = plugin.get('onStateChange');
      for (let listener of listeners) {
        store.subscribe(listener);
      }

      // start saga
      sagas.forEach(sagaMiddleware.run);

      // setup history
      if (setupHistory) setupHistory.call(this, history);

      // run subscriptions
      for (let model of this._models) {
        if (model.subscriptions) {
          runSubscriptions(model.subscriptions, model, this, onErrorWrapper);
        }
      }

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
      const ReactDOM = require('react-dom');
      ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
    }

    function checkModel(m, mobile) {
      // Clone model to avoid prefixing namespace multiple times
      const model = { ...m };
      const { namespace, reducers, effects } = model;

      invariant(
        namespace,
        'app.model: namespace should be defined'
      );
      invariant(
        mobile || namespace !== 'routing',
        'app.model: namespace should not be routing, it\'s used by react-redux-router'
      );
      invariant(
        !model.subscriptions || isPlainObject(model.subscriptions),
        'app.model: subscriptions should be Object'
      );
      invariant(
        !reducers || isPlainObject(reducers) || Array.isArray(reducers),
        'app.model: reducers should be Object or array'
      );
      invariant(
        !Array.isArray(reducers) || (isPlainObject(reducers[0]) && typeof reducers[1] === 'function'),
        'app.model: reducers with array should be app.model({ reducers: [object, function] })'
      );
      invariant(
        !effects || isPlainObject(effects),
        'app.model: effects should be Object'
      );

      function applyNamespace(type) {
        function getNamespacedReducers(reducers) {
          return Object.keys(reducers).reduce((memo, key) => {
            warning(
              key.indexOf(`${namespace}${SEP}`) !== 0,
              `app.model: ${type.slice(0, -1)} ${key} should not be prefixed with namespace ${namespace}`
            );
            memo[`${namespace}${SEP}${key}`] = reducers[key];
            return memo;
          }, {});
        }

        if (model[type]) {
          if (type === 'reducers' && Array.isArray(model[type])) {
            model[type][0] = getNamespacedReducers(model[type][0]);
          } else {
            model[type] = getNamespacedReducers(model[type]);
          }
        }
      }

      applyNamespace('reducers');
      applyNamespace('effects');

      return model;
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

    function getSaga(effects, model, onError) {
      return function *() {
        for (let key in effects) {
          const watcher = getWatcher(key, effects[key], model, onError);
          yield sagaEffects.fork(watcher);
        }
      }
    }

    function getWatcher(key, _effect, model, onError) {
      let effect = _effect;
      let type = 'takeEvery';
      let ms;

      if (Array.isArray(_effect)) {
        effect = _effect[0];
        const opts = _effect[1];
        if (opts && opts.type) {
          type = opts.type;
          if (type === 'throttle') {
            invariant(
              opts.ms,
              'app.start: opts.ms should be defined if type is throttle'
            );
            ms = opts.ms;
          }
        }
        invariant(
          ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
          'app.start: effect type should be takeEvery, takeLatest, throttle or watcher'
        );
      }

      function *sagaWithCatch(...args) {
        try {
          yield effect(...args.concat(createEffects(model)));
        } catch(e) {
          onError(e);
        }
      }

      const onEffect = plugin.get('onEffect');
      const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

      switch (type) {
        case 'watcher':
          return sagaWithCatch;
        case 'takeLatest':
          return function*() {
            yield takeLatest(key, sagaWithOnEffect);
          };
        case 'throttle':
          return function*() {
            yield throttle(ms, key, sagaWithOnEffect);
          };
        // takeEvery
        default:
          return function*() {
            yield takeEvery(key, sagaWithOnEffect);
          };
      }
    }

    function runSubscriptions(subs, model, app, onError) {
      for (let key in subs) {
        const sub = subs[key];
        invariant(typeof sub === 'function', 'app.start: subscription should be function');
        sub({
          dispatch: createDispach(app._store.dispatch, model),
          history: app._history,
        }, onError);
      }
    }

    function prefixType(type, model) {
      const prefixedType = `${model.namespace}${SEP}${type}`;
      if ((model.reducers && model.reducers[prefixedType])
        || (model.effects && model.effects[prefixedType])) {
        return prefixedType;
      }
      return type;
    }

    function createEffects(model) {
      function put(action) {
        const { type } = action;
        invariant(type, 'dispatch: action should be a plain Object with type');
        warning(
          type.indexOf(`${model.namespace}${SEP}`) !== 0,
          `effects.put: ${type} should not be prefixed with namespace ${model.namespace}`
        );
        return sagaEffects.put({ ...action, type: prefixType(type, model) });
      }
      return { ...sagaEffects, put };
    }

    function createDispach(dispatch, model) {
      return action => {
        const { type } = action;
        invariant(type, 'dispatch: action should be a plain Object with type');
        warning(
          type.indexOf(`${model.namespace}${SEP}`) !== 0,
          `dispatch: ${type} should not be prefixed with namespace ${model.namespace}`
        );
        return dispatch({ ...action, type: prefixType(type, model) });
      };
    }

    function applyOnEffect(fns, effect, model, key) {
      for (let fn of fns) {
        effect = fn(effect, sagaEffects, model, key);
      }
      return effect;
    }

  };
}
