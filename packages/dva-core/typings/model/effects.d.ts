import {
  all,
  call,
  put,
  select,
  take,
  cancel,
  join,
  race,
  fork,
  actionChannel,
  flush,
  cancelled,
  takem,
  spawn,
  cps,
  apply,
  getContext,
  setContext,
} from 'redux-saga/effects';
import { AnyAction } from 'redux';
/**
 * Copied from redux-saga@0.16.2 typing
 */
type Saga1<T1> = (arg1: T1) => Iterator<any>;
type Saga2<T1, T2> = (arg1: T1, arg2: T2) => Iterator<any>;

declare module './' {

  /**
   * NOTE: In future version of dva (@3.x), we should deliberately select the effect "exposed by typescript" as most of the effects are seldom used and should only be type-augumented by advanced developers. We should as well dinstinct the effects exposed in between normal effect and "watcher" effect.
   */
  interface EffectsCommandMap {
    all: typeof all;
    call: typeof call;
    put: typeof put;
    select: typeof select;
    take: typeof take;
    cancel: typeof cancel;
    join: typeof join;
    race: typeof race;
    fork: typeof fork;
    actionChannel: typeof actionChannel;
    flush: typeof flush;
    cancelled: typeof cancelled;
    takem: typeof takem;
    spawn: typeof spawn;
    cps: typeof cps;
    apply: typeof apply;
    getContext: typeof getContext;
    setContext: typeof setContext;
  }

  type Effect = Saga2<AnyAction, EffectsCommandMap>;
  type EffectTakeEvery = [Saga2<AnyAction, EffectsCommandMap>, { type: 'takeEvery' }];
  type EffectTakeLatest = [Saga2<AnyAction, EffectsCommandMap>, { type: 'takeLatest' }];
  type EffectThrottle = [Saga2<AnyAction, EffectsCommandMap>, { type: 'throttle'; ms: number }];
  type EffectPoll = [Saga2<AnyAction, EffectsCommandMap>, { type: 'poll'; delay: number }];
  /**
   * Note that code suggestion for dicriminated union as tuples is not well supported till now (Typescript 3.9). So when `[function*({  }) { } {type: 'watcher' }]` is written, no code suggestion for generator function parameters.
   * See: https://github.com/microsoft/TypeScript/issues/31977
   *
   * Also note that "watcher" pattern does not follow the same API mindset as takeLatest, throttle, etc. We probably should move "watcher" to the first class API surface in future version of dva (@3.x). Refer to https://redux-saga.js.org/docs/advanced/FutureActions.html for more "watcher" pattern explanation.
   */
  type EffectWatcher = [Saga1<EffectsCommandMap>, { type: 'watcher' }];
  type EffectType =
    | EffectTakeEvery[1]['type']
    | EffectTakeLatest[1]['type']
    | EffectThrottle[1]['type']
    | EffectPoll[1]['type']
    | EffectWatcher[1]['type'];
  type EffectWithType = EffectWatcher | EffectTakeEvery | EffectTakeLatest | EffectThrottle | EffectPoll;

  type EffectsMapObject = {
    [key: string]: Effect | EffectWithType,
  }
  interface Model<S> {
    effects?: EffectsMapObject;
  }
}