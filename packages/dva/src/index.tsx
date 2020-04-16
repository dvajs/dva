import React from 'react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';
import { createHashHistory, History } from 'history';
import document from 'global/document';
import {
  Provider,
} from 'react-redux';
import { Store } from 'redux';
import { utils, create, DvaOptionsAndDvaHooks, CreateOpts, DvaInstance, DvaRouter } from 'dva-core';
import { connectRouter, routerMiddleware, RouterRootState } from 'connected-react-router';
import { ExtractProps, Subtract } from './typings/utils';

const { isFunction } = utils;

declare module 'dva-core' {
  export type RouterAPI = {
    history: History; app: DvaInstance
  }

  /**
   * @deprecated
   * Conserved for compatibility reason. Use `DvaRouter` instead.
   */
  export interface Router {
    (api?: RouterAPI): JSX.Element | Object,
  }

  export type DvaRouter = {
    // WIP cxi: React.ReactElement<ExtractProps<import('react-router-dom').Router>> 这个定义好像有问题
    (api?: RouterAPI): React.ReactElement<ExtractProps<import('react-router-dom').Router>> | Object,
  }
  export interface DvaInstance {
    /**
     * Config router. Takes a function with arguments { history, app },
     * and expects router config. It use the same api as react-router,
     * return jsx elements or JavaScript Object for dynamic routing.
     *
     * @param router
     */
    router: (router: DvaRouter) => void;
    _router?: DvaRouter;
    _history?: History;
    /**
     * exported for HMR
     */
    _getProvider<T extends DvaRouter>(router: T): React.FC<Subtract<T, DvaRouter>>; // WIP cxi: 这个定义好像有问题

  }
}

declare module 'react-redux' {
  interface DefaultRootState extends RouterRootState {}
}

function dva(opts: DvaOptionsAndDvaHooks = {}) {
  console.log('WIP cxi');
  const history = opts.history || createHashHistory();
  const createOpts:CreateOpts = {
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

  function router(router: DvaRouter) {
    invariant(
      isFunction(router),
      `[app.router] router should be function, but got ${typeof router}`,
    );
    app._router = router;
  }

  function start(this: DvaInstance, container?: Element | string) {
    let $container: Element | undefined | null = null;
    // 允许 container 是字符串，然后用 querySelector 找元素
    if (isString(container)) {
      $container = document.querySelector(container);
      invariant($container, `[app.start] container ${$container} not found`);
    }

    // 或者是 Element
    invariant(isUndefinedOrElement(container),
      `[app.start] container should be Element`,
    );
    if ($container === null) {
      $container = container;
    }
    // 路由必须提前注册
    invariant(app._router, `[app.start] router must be registered before app.start()`);

    if (!app._store) {
      oldAppStart.call(app);
    }
    const store = app._store!;

    // export _getProvider for HMR
    // ref: https://github.com/dvajs/dva/issues/469
    app._getProvider = getProvider.bind(null, store, app);

    // If has container, render; else, return react component
    if ($container) {
      render($container, store, app, app._router);
      app._plugin.apply('onHmr')(render.bind(null, $container, store, app));
    } else {
      return getProvider(store, this, this._router!);
    }
    return;
  }
}

function isUndefinedOrElement(node: any): node is undefined|Element {
  return typeof node === 'undefined' || (typeof node === 'object' && node !== null && Boolean(node.nodeType) && Boolean(node.nodeName));
}

function isString(str: string | Element | undefined): str is string {
  return typeof str === 'string';
}

function getProvider(store: Store, app: DvaInstance, router: DvaRouter) {
  const DvaRoot = (extraProps: object) => (
    <Provider store={store}>{router({ app, history: app._history!, ...extraProps })}</Provider>
  );
  return DvaRoot;
}

function render(container: Element, store: Store, app: DvaInstance, router: DvaRouter) {
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}

function patchHistory(history: History) {
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

export default dva;
export * from 'dva-core';
export { default as fetch } from 'isomorphic-fetch';
export { default as dynamic } from './dynamic';
export { connect, connectAdvanced, useSelector, useDispatch, useStore, shallowEqual } from 'react-redux';
export { bindActionCreators } from 'redux';
export * as router from 'react-router-dom';
export * as routerRedux from 'connected-react-router';
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
export { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom';
