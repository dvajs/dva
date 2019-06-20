import {
  Reducer,
  AnyAction,
  ReducersMapObject,
  Dispatch,
  MiddlewareAPI,
  StoreEnhancer,
  Store
} from 'redux';

export interface onActionFunc {
  (api: MiddlewareAPI<any>): void,
}

export interface ReducerEnhancer {
  (reducer: Reducer<any>): void,
}

export interface Hooks {
  onError?: (e: Error, dispatch: Dispatch<any>) => void,
  onAction?: onActionFunc | onActionFunc[],
  onStateChange?: () => void,
  onReducer?: ReducerEnhancer,
  onEffect?: () => void,
  onHmr?: () => void,
  extraReducers?: ReducersMapObject,
  extraEnhancers?: StoreEnhancer<any>[],
}

export type HooksAndOpts = Hooks & {
  initialState?: Object,
}

export interface CreateOpts {
  initialState?: Object,
  setupApp?: Function,
}

export interface EffectsCommandMap {
  put: <A extends AnyAction>(action: A) => any,
  call: Function,
  select: Function,
  take: Function,
  cancel: Function,
  [key: string]: any,
}

export type Effect = (action: AnyAction, effects: EffectsCommandMap) => void;
export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle';
export type EffectWithType = [Effect, { type : EffectType }];
export type Subscription = (api: SubscriptionAPI, done: Function) => void;
export type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer];

export interface EffectsMapObject {
  [key: string]: Effect | EffectWithType,
}

export interface SubscriptionAPI {
  history: History,
  dispatch: Dispatch<any>,
}

export interface SubscriptionsMapObject {
  [key: string]: Subscription,
}

export interface Model {
  namespace: string,
  state?: any,
  reducers?: ReducersMapObject | ReducersMapObjectWithEnhancer,
  effects?: EffectsMapObject,
  subscriptions?: SubscriptionsMapObject,
}

export interface DvaStore extends Store<any> {
  runSaga: (saga: any) => any
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
  start: () => any,
  _models: any,
  _plugins: Plugin,
  _store: DvaStore
}

export function create(hooksAndOpts?: HooksAndOpts, createOpts?: CreateOpts): DvaInstance;
