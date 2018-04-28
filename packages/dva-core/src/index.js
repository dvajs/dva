import { combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga/lib/internal/middleware';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import rxjs, { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import invariant from 'invariant';
import checkModel from './checkModel';
import prefixNamespace from './prefixNamespace';
import Plugin, { filterHooks } from './Plugin';
import createStore from './createStore';
import getSaga from './getSaga';
import getReducer from './getReducer';
import createPromiseMiddleware from './createPromiseMiddleware';

// 载入model
import fetchModel, { generalState } from './models/fetch';

import {
  run as runSubscription,
  unlisten as unlistenSubscription,
} from './subscription';
import { noop } from './utils';

// Internal model to update global state when do unmodel
const dvaModel = {
  namespace: '@@dva',
  state: 0,
  reducers: {
    UPDATE(state) { return state + 1; },
  },
};

/**
 * Create dva-core instance.
 *
 * @param hooksAndOpts
 * @param createOpts
 */
export function create(hooksAndOpts = {}, createOpts = {}) {
  const {
    initialReducer,
    setupApp = noop,
  } = createOpts;

  const plugin = new Plugin();
  plugin.use(filterHooks(hooksAndOpts));

  const app = {
    _models: [
      prefixNamespace({ ...dvaModel }),
      hooksAndOpts.fetchConfig && prefixNamespace({ ...fetchModel(hooksAndOpts.fetchConfig) }),
    ],
    _store: null,
    _plugin: plugin,
    use: plugin.use.bind(plugin),
    rootEpic: {},
    model,
    start,
  };
  return app;

  /**
   * Register model before app is started.
   *
   * @param m {Object} model to register
   */
  function model(m) {
    if (process.env.NODE_ENV !== 'production') {
      checkModel(m, app._models);
    }
    m.reducers.generalState = generalState
    app._models.push(prefixNamespace(m));
  }

  /**
   * Inject model after app is started.
   *
   * @param createReducer
   * @param onError
   * @param unlisteners
   * @param m
   */
  function injectModel(createReducer, onError, unlisteners, m) {
    model(m);

    const store = app._store;
    if (m.reducers) {
      store.asyncReducers[m.namespace] = getReducer(m.reducers, m.state);
      store.replaceReducer(createReducer(store.asyncReducers));
    }
    if (m.epics) {
      app.rootEpic = { ...app.rootEpic, ...m.epics };
      app.epicMiddleware.replaceEpic(app.rootEpic);
    }

    if (m.effects) {
      store.runSaga(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));
    }
    if (m.subscriptions) {
      unlisteners[m.namespace] = runSubscription(m.subscriptions, m, app, onError);
    }
  }

  /**
   * Unregister model.
   *
   * @param createReducer
   * @param reducers
   * @param unlisteners
   * @param namespace
   *
   * Unexpected key warn problem:
   * https://github.com/reactjs/redux/issues/1636
   */
  function unmodel(createReducer, reducers, unlisteners, namespace) {
    const store = app._store;

    // Delete reducers
    delete store.asyncReducers[namespace];
    delete reducers[namespace];
    store.replaceReducer(createReducer());
    store.dispatch({ type: '@@dva/UPDATE' });

    // Cancel effects
    store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

    // Unlisten subscrioptions
    unlistenSubscription(unlisteners, namespace);

    // Delete model from app._models
    app._models = app._models.filter(model => model.namespace !== namespace);
  }

  /**
   * Start the app.
   *
   * @returns void
   */
  function start() {
    // Global error handler
    const onError = (err) => {
      if (err) {
        if (typeof err === 'string') err = new Error(err);
        err.preventDefault = () => {
          err._dontReject = true;
        };
        plugin.apply('onError', (err) => {
          throw new Error(err.stack || err);
        })(err, app._store.dispatch);
      }
    };

    const sagaMiddleware = createSagaMiddleware();
    const {
      middleware: promiseMiddleware,
      resolve,
      reject,
    } = createPromiseMiddleware(app);
    app._getSaga = getSaga.bind(null, resolve, reject);

    const sagas = [];
    const reducers = { ...initialReducer };
    for (const m of app._models) {
      reducers[m.namespace] = getReducer(m.reducers, m.state);
      app.rootEpic = { ...app.rootEpic, ...m.epics };
      if (m.effects) sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));
    }
    const reducerEnhancer = plugin.get('onReducer');
    const extraReducers = plugin.get('extraReducers');
    invariant(
      Object.keys(extraReducers).every(key => !(key in reducers)),
      `[app.start] extitraReducers is conflict with other reducers, reducers list: ${Object.keys(reducers).join(', ')}`,
    );
    app.epicMiddleware = createEpicMiddleware(combineEpics(...Object.keys(app.rootEpic).map(e => app.rootEpic[e])), { dependencies: { ajax, Observable } });
    // Create store
    const store = app._store = createStore({ // eslint-disable-line
      reducers: createReducer(),
      initialState: hooksAndOpts.initialState || {},
      plugin,
      createOpts,
      sagaMiddleware,
      promiseMiddleware,
      epicMiddleware: app.epicMiddleware,
    });

    // Extend store
    store.runSaga = sagaMiddleware.run;
    store.asyncReducers = {};

    // Execute listeners when state is changed
    const listeners = plugin.get('onStateChange');
    for (const listener of listeners) {
      store.subscribe(() => {
        listener(store.getState());
      });
    }

    // Run sagas
    sagas.forEach(sagaMiddleware.run);

    // Setup app
    setupApp(app);

    // Run subscriptions
    const unlisteners = {};
    for (const model of this._models) {
      if (model.subscriptions) {
        unlisteners[model.namespace] = runSubscription(model.subscriptions, model, app, onError);
      }
    }

    // Setup app.model and app.unmodel
    app.model = injectModel.bind(app, createReducer, onError, unlisteners);
    app.unmodel = unmodel.bind(app, createReducer, reducers, unlisteners);

    /**
     * Create global reducer for redux.
     *
     * @returns {Object}
     */
    function createReducer() {
      return reducerEnhancer(combineReducers({
        ...reducers,
        ...extraReducers,
        ...(app._store ? app._store.asyncReducers : {}),
      }));
    }
  }
}
