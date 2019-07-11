import {
  ReducersMapObject,
  Dispatch,
  MiddlewareAPI,
  StoreEnhancer,
  bindActionCreators,
} from 'redux';

import { Saga } from 'redux-saga';
import { ActionCreator, createActionCreatorFactory } from 'dva-action';
import {
  take,
  put,
  all,
  race,
  call,
  cps,
  fork,
  join,
  cancel,
  select,
  actionChannel,
  cancelled,
  flush,
  getContext,
  setContext,
  takeMaybe,
  apply,
  putResolve,
  spawn,
  retry,
  delay,
} from 'redux-saga/effects';

import { History } from 'history';

export interface OnActionFunc {
  (api: MiddlewareAPI<any>): void;
}

export type Reducer<S = any, A = any> = (state: S, action: A) => S;

export interface ReducerEnhancer<S = any> {
  (reducer: Reducer<S>): Reducer<S>;
}

export interface Hooks {
  onError?: (e: Error, dispatch: Dispatch<any>) => void;
  onAction?: OnActionFunc | OnActionFunc[];
  onStateChange?: () => void;
  onReducer?: ReducerEnhancer;
  onEffect?: () => void;
  onHmr?: () => void;
  extraReducers?: ReducersMapObject;
  extraEnhancers?: StoreEnhancer<any>[];
}

export type DvaOption = Hooks & {
  namespacePrefixWarning?: boolean;
  initialState?: Object;
  history?: Object;
};

export interface EffectsCommandMap {
  take: typeof take;
  put: typeof put;
  all: typeof all;
  race: typeof race;
  call: typeof call;
  cps: typeof cps;
  fork: typeof fork;
  join: typeof join;
  cancel: typeof cancel;
  select: typeof select;
  actionChannel: typeof actionChannel;
  cancelled: typeof cancelled;
  flush: typeof flush;
  getContext: typeof getContext;
  setContext: typeof setContext;
  takeMaybe: typeof takeMaybe;
  apply: typeof apply;
  putResolve: typeof putResolve;
  spawn: typeof spawn;
  retry: typeof retry;
  delay: typeof delay;
}

export type DefaultSaga<T_Action> = Saga<[T_Action, EffectsCommandMap]>;
export type TakeEverySaga<T_Action> = [DefaultSaga<T_Action>, { type: 'takeEvery' }];
export type TakeLatestSaga<T_Action> = [DefaultSaga<T_Action>, { type: 'takeLatest' }];
export type ThrottleSaga<T_Action> = [DefaultSaga<T_Action>, { type: 'throttle'; ms: number }];
export type DebounceSaga<T_Action> = [DefaultSaga<T_Action>, { type: 'debounce'; ms: number }];
export type PollSaga<T_Action> = [DefaultSaga<T_Action>, { type: 'poll'; delay: number }];
export type Watcher = Saga<[EffectsCommandMap]>;

type ActionCreatorMapObject = {
  [k: string]: ActionCreator<any>;
};

export type EffectsMapObject<T_State, T_EffectActionCreatorMapObject> = {
  [K in keyof T_EffectActionCreatorMapObject]: T_EffectActionCreatorMapObject[K] extends {
    start: any;
    stop: any;
  }
    ? PollSaga<ReturnType<T_EffectActionCreatorMapObject[K]['start']>>
    : T_EffectActionCreatorMapObject[K] extends (...args: any[]) => any
    ?
        | DefaultSaga<ReturnType<T_EffectActionCreatorMapObject[K]>>
        | TakeLatestSaga<ReturnType<T_EffectActionCreatorMapObject[K]>>
        | TakeEverySaga<ReturnType<T_EffectActionCreatorMapObject[K]>>
        | ThrottleSaga<ReturnType<T_EffectActionCreatorMapObject[K]>>
        | DebounceSaga<ReturnType<T_EffectActionCreatorMapObject[K]>>
    : any
};

export type WatchersMapObject = {[k: string]: Watcher};

export type Subscription = (api: SubscriptionAPI, done: Function) => void;

export interface SubscriptionAPI {
  history: History;
  dispatch: Dispatch<any>;
}

export interface SubscriptionsMapObject {
  [key: string]: Subscription;
}

export type ReducersMapObjectWithEnhancer<
  T_State = any,
  T_ReducerActionCreatorMapObject = any
> = T_ReducerActionCreatorMapObject extends ActionCreatorMapObject
  ? {
      [K in keyof T_ReducerActionCreatorMapObject]:
        | Reducer<T_State, ReturnType<T_ReducerActionCreatorMapObject[K]>>
        | [Reducer<T_State>, ReducerEnhancer<T_State>]
    }
  : { [k: string]: Reducer<any, any> | [Reducer<any>, ReducerEnhancer<any>] };

export interface Model<
  T_State,
  T_EffectActionCreatorMapObject = any,
  T_ReducerActionCreatorMapObject = any
> {
  namespace: string;
  state: T_State;
  reducers?: ReducersMapObjectWithEnhancer<T_State, T_ReducerActionCreatorMapObject>;
  effects?: EffectsMapObject<T_State, T_EffectActionCreatorMapObject>;
  watchers? : WatchersMapObject;
  subscriptions?: SubscriptionsMapObject;
}

export interface RouterAPI {
  history: History;
  app: DvaInstance;
}

export interface Router {
  (api?: RouterAPI): JSX.Element | Object;
}

export interface DvaInstance {
  /**
   * Register an object of hooks on the application.
   *
   * @param hooks
   */
  use: (hooks: Hooks) => void;

  /**
   * Register a model.
   *
   * @param model
   */
  model: (model: Model<any>) => void;

  /**
   * Unregister a model.
   *
   * @param namespace
   */
  unmodel: (namespace: string) => void;

  /**
   * Config router. Takes a function with arguments { history, dispatch },
   * and expects router config. It use the same api as react-router,
   * return jsx elements or JavaScript Object for dynamic routing.
   *
   * @param router
   */
  router: (router: Router) => void;

  /**
   * Start the application. Selector is optional. If no selector
   * arguments, it will return a function that return JSX elements.
   *
   * @param selector
   */
  start: (selector?: HTMLElement | string) => any;
}

export default function dva(opts?: DvaOption): DvaInstance;

export { bindActionCreators };

export {
  connect,
  connectAdvanced,
  useSelector,
  useDispatch,
  useStore,
  DispatchProp,
  shallowEqual,
} from 'react-redux';

import * as routerRedux from 'connected-react-router';
export { routerRedux };

import * as fetch from 'isomorphic-fetch';
export { fetch };

import * as router from 'react-router-dom';
import { any } from 'prop-types';
export { router };
export { createActionCreatorFactory };
export { Saga };
