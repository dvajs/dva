import {
  Reducer,
  Action,
  ReducersMapObject,
  Dispatch,
  MiddlewareAPI
} from 'redux';

export interface onActionFunc {
  (api: MiddlewareAPI<any>): void;
}

export interface ReducerEnhancer {
  (reducer: Reducer<any>): void
}

export interface Hooks {
  onError?: (e: Error, dispatch: Dispatch<any>) => void;
  onAction?: onActionFunc | onActionFunc[];
  onStateChange?: () => void;
  onReducer?: ReducerEnhancer;
  onEffect?: () => void;
  onHmr?: () => void;
  extraReducers?: ReducersMapObject;
}

export type DvaOption = Hooks & {
  initialState?: Object;
  history?: Object;
}

export interface EffectsCommandMap {
  put: <A extends Action>(action: A) => any;
  call: Function;
  select: Function;
  take: Function;
  cancel: Function;
  [key: string]: any;
}

export type Effect = (action: Action, effects: EffectsCommandMap) => void;
export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle';
export type EffectWithType = [Effect, { type : EffectType }];
export type Subscription = (api: SubscriptionAPI, done: Function) => void;
export type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer];

export interface EffectsMapObject {
  [key: string]: Effect | EffectWithType;
}

export interface SubscriptionAPI {
  history: HistoryModule.History;
  dispatch: Dispatch<any>;
}

export interface SubscriptionsMapObject {
  [key: string]: Subscription;
}

export interface Model {
  namespace: string,
  state?: any,
  reducers?: ReducersMapObject | ReducersMapObjectWithEnhancer,
  effects?: EffectsMapObject,
  subscriptions?: SubscriptionsMapObject,
}

export interface RouterAPI {
  history: HistoryModule.History;
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
  use: (hooks: Hooks) => void,

  /**
   * Register a model.
   *
   * @param model
   */
  model: (model: Model) => void,

  /**
   * Config router. Takes a function with arguments { history, dispatch },
   * and expects router config. It use the same api as react-router,
   * return jsx elements or JavaScript Object for dynamic routing.
   *
   * @param router
   */
  router: (router: Router) => void,

  /**
   * Start the application. Selector is optional. If no selector
   * arguments, it will return a function that return JSX elements.
   *
   * @param selector
   */
  start: (selector?: HTMLElement | string) => any,
}

export default function dva(opts?: DvaOption): DvaInstance;

/**
 * Connects a React component to Dva.
 */
export function connect(
  mapStateToProps?: Function,
  mapDispatchToProps?: Function,
  mergeProps?: Function,
  options?: Object
): Function;
