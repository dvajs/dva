import Router from "react-router/lib/Router"
import Link from "react-router/lib/Link"
import IndexLink from "react-router/lib/IndexLink"
import IndexRedirect from "react-router/lib/IndexRedirect"
import IndexRoute from "react-router/lib/IndexRoute"
import Redirect from "react-router/lib/Redirect"
import Route from "react-router/lib/Route"
import History from "react-router/lib/History"
import Lifecycle from "react-router/lib/Lifecycle"
import RouteContext from "react-router/lib/RouteContext"
import browserHistory from "react-router/lib/browserHistory"
import hashHistory from "react-router/lib/hashHistory"
import useRoutes from "react-router/lib/useRoutes"
import { createRoutes } from "react-router/lib/RouteUtils"
import { formatPattern } from "react-router/lib/PatternUtils"
import RouterContext from "react-router/lib/RouterContext"
import PropTypes from "react-router/lib/PropTypes"
import match from "react-router/lib/match"
import useRouterHistory from "react-router/lib/useRouterHistory";
import createMemoryHistory from "react-router/lib/createMemoryHistory";
import withRouter from "react-router/lib/withRouter";
import applyRouterMiddleware from "react-router/lib/applyRouterMiddleware";

// PlainRoute is defined in the API documented at:
// https://github.com/rackt/react-router/blob/master/docs/API.md
// but not included in any of the .../lib modules above.
export type PlainRoute = ReactRouter.PlainRoute

// The following definitions are also very useful to export
// because by using these types lots of potential type errors
// can be exposed:
export type EnterHook = ReactRouter.EnterHook
export type LeaveHook = ReactRouter.LeaveHook
export type ParseQueryString = ReactRouter.ParseQueryString
export type RedirectFunction = ReactRouter.RedirectFunction
export type RouteComponentProps<P, R> = ReactRouter.RouteComponentProps<P, R>;
export type RouteHook = ReactRouter.RouteHook
export type StringifyQuery = ReactRouter.StringifyQuery
export type RouterListener = ReactRouter.RouterListener
export type RouterState = ReactRouter.RouterState
export type HistoryBase = ReactRouter.HistoryBase
export type RouterOnContext = ReactRouter.RouterOnContext
export type RouteProps = ReactRouter.RouteProps

interface routerRedux {
  routerStateReducer: Function,
  ReduxRouter: Function,
  reduxReactRouter: Function,
  isActive: Function,
  historyAPI: Function,
  push: Function,
  replace: Function,
  setState: Function,
  go: Function,
  goBack: Function,
  goForward: Function,
}

export const routerRedux: routerRedux;

export {
  Router,
  Link,
  IndexLink,
  IndexRedirect,
  IndexRoute,
  Redirect,
  Route,
  History,
  browserHistory,
  hashHistory,
  Lifecycle,
  RouteContext,
  useRoutes,
  createRoutes,
  formatPattern,
  RouterContext,
  PropTypes,
  match,
  useRouterHistory,
  createMemoryHistory,
  withRouter,
  applyRouterMiddleware
};

export default Router;
