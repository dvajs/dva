// NOTE: This file should net be here if all dva-dore is rewritten in TypeScript
import { Store, StoreEnhancer, ReducersMapObject, Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { Model, ReducerEnhancer } from './model';
import { History } from 'history';
import Plugin from '../src/Plugin'; // NOTE: src should be packaged for the moment because "Plugin" and "utils" are served as type

// We augument Dispatch definition because of Promise middleware
declare module 'redux' {
  interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: T): Promise<any>;
  }
}

export type DvaHooks = {
  onError?: (e: Error, dispatch: Dispatch<any>) => void,
  onAction?: OnActionFunc | OnActionFunc[],
  onStateChange?: () => void,
  onReducer?: ReducerEnhancer,
  onEffect?: () => void,
  onHmr?: () => void,
  extraReducers?: ReducersMapObject,
  extraEnhancers?: StoreEnhancer<any>[],
  // _handleActions:  // WIP cxi
};

/**
 * @deprecated
 * Conserved for compatibility reason. Use `DvaHooks` instead.
 */
export type Hooks = DvaHooks;

/**
 *
 * Create dva-core instance
 */
export interface DvaInstance {
  /**
   * Register an object of hooks on the application. Note that the "hooks" here has nothing to do with react hooks.
   *
   * @param hooks
   */
  use: (hooks: DvaHooks) => void,

  /**
   * Register a model
   *
   * @param model
   * @returns - a prefixed model
   */
  model: <S>(model: Model<S>) => Model<S>;

  /**
   * Unregister a model.
   *
   * @param namespace
   */
  unmodel: (namespace: string) => void;

  replaceModel: <S>(model: Model<S>) => void;

  /**
   * Start the application. Selector is optional. If no selector
   * arguments, it will return a function that return JSX elements.
   *
   * @param selector
   */
  start: (selector?: HTMLElement | string) => any;
  _store: Store | null;
  _models: Model<any>[];
  _plugin: Plugin;
  _getSaga?: Function;
}

export type DvaOptions = {
  namespacePrefixWarning?: boolean;
  initialState?: object;
  history?: History;
}

export type OnActionFunc = (api: MiddlewareAPI<any>) => void;

/**
 * @deprecated
 * Conserved for compatibility reason. Use `OnActionFunc` instead.
 */
export interface onActionFunc {
  (api: MiddlewareAPI<any>): void,
}

export type DvaOptionsAndDvaHooks = DvaOptions & DvaHooks;

/**
 * @deprecated
 * Conserved for compatibility reason. Use `DvaHooksAndDvaOptions` instead.
 */
export type DvaOption = DvaOptionsAndDvaHooks;

export type CreateOpts = {
  initialReducer: ReducersMapObject<any, any>,
  setupApp: (app: DvaInstance) => void;

  /** Give a chance to append other middlewares (usually router middleware) onto dva-core registered middlewares */
  setupMiddlewares: (middlewares: Middleware[]) => Middleware[];
};

export declare function create(optsAndHooks: DvaOptionsAndDvaHooks, createOpts: CreateOpts): DvaInstance;

export * as saga from 'redux-saga';

export * as utils from '../src/utils';

export * from './model';

export { Dispatch } from 'redux';
export { DispatchProp } from 'react-redux';