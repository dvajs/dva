import React from 'react';
import invariant from 'invariant';
import { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
import document from 'global/document';
import {
  Provider,
  connect,
  connectAdvanced,
  useSelector,
  useDispatch,
  useStore,
  shallowEqual,
} from 'react-redux';
import { bindActionCreators } from 'redux';
import { utils, create, saga } from 'dva-core';
import * as router from 'react-router-dom';
import * as routerRedux from 'connected-react-router';

const { connectRouter, routerMiddleware } = routerRedux;
const { isFunction } = utils;
const { useHistory, useLocation, useParams, useRouteMatch } = router;

export default function(opts = {}) {
  const history = opts.history || createHashHistory();
  const createOpts = {
    initialReducer: {
      router: connectRouter(history),
    },
    setupMiddlewares(middlewares) {
      return [routerMiddleware(history), ...middlewares];
    },
    setupApp(app) {
      app._history = patchHistory(history);
    },
  };

  const app = create(opts, createOpts);
  const oldAppStart = app.start;
  app.router = router;
  app.start = start;
  return app;

  function router(router) {
    invariant(
      isFunction(router),
      `[app.router] router should be function, but got ${typeof router}`,
    );
    app._router = router;
  }

  function start(container) {
    // 允许 container 是字符串，然后用 querySelector 找元素
    if (isString(container)) {
      container = document.querySelector(container);
      invariant(container, `[app.start] container ${container} not found`);
    }

    // 并且是 HTMLElement
    invariant(
      !container || isHTMLElement(container),
      `[app.start] container should be HTMLElement`,
    );

    // 路由必须提前注册
    invariant(app._router, `[app.start] router must be registered before app.start()`);

    if (!app._store) {
      oldAppStart.call(app);
    }
    const store = app._store;

    // export _getProvider for HMR
    // ref: https://github.com/dvajs/dva/issues/469
    app._getProvider = getProvider.bind(null, store, app);

    // If has container, render; else, return react component
    if (container) {
      render(container, store, app, app._router);
      app._plugin.apply('onHmr')(render.bind(null, container, store, app));
    } else {
      return getProvider(store, this, this._router);
    }
  }
}

function isHTMLElement(node) {
  return typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
}

function isString(str) {
  return typeof str === 'string';
}

function getProvider(store, app, router) {
  const DvaRoot = extraProps => (
    <Provider store={store}>{router({ app, history: app._history, ...extraProps })}</Provider>
  );
  return DvaRoot;
}

function render(container, store, app, router) {
  const ReactDOM = require('react-dom'); // eslint-disable-line
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}

function patchHistory(history) {
  const oldListen = history.listen;
  history.listen = callback => {
    // TODO: refact this with modified ConnectedRouter
    // Let ConnectedRouter to sync history to store first
    // connected-react-router's version is locked since the check function may be broken
    // min version of connected-react-router
    // e.g.
    // function (e, t) {
    //   var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    //   r.inTimeTravelling ? r.inTimeTravelling = !1 : a(e, t, n)
    // }
    // ref: https://github.com/umijs/umi/issues/2693
    const cbStr = callback.toString();
    const isConnectedRouterHandler =
      (callback.name === 'handleLocationChange' && cbStr.indexOf('onLocationChanged') > -1) ||
      (cbStr.indexOf('.inTimeTravelling') > -1 &&
        cbStr.indexOf('.inTimeTravelling') > -1 &&
        cbStr.indexOf('arguments[2]') > -1);
    callback(history.location, history.action);
    return oldListen.call(history, (...args) => {
      if (isConnectedRouterHandler) {
        callback(...args);
      } else {
        // Delay all listeners besides ConnectedRouter
        setTimeout(() => {
          callback(...args);
        });
      }
    });
  };
  return history;
}

export fetch from 'isomorphic-fetch';
export dynamic from './dynamic';
export { connect, connectAdvanced, useSelector, useDispatch, useStore, shallowEqual };
export { bindActionCreators };
export { router };
export { saga };
export { routerRedux };
export { createBrowserHistory, createMemoryHistory, createHashHistory };
export { useHistory, useLocation, useParams, useRouteMatch };
