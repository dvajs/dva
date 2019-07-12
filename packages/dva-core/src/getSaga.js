import invariant from 'invariant';
import warning from 'warning';
import { effects as sagaEffects } from 'redux-saga';
import { NAMESPACE_SEP } from './constants';
import prefixType from './prefixType';

export default function getSaga(effects, model, onError, onEffect, opts = {}) {
  return function*() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(key, effects[key], model, onError, onEffect, opts);
        const task = yield sagaEffects.fork(watcher);
        yield sagaEffects.fork(function*() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}

function getWatcher(key, _effect, model, onError, onEffect, opts) {
  let effect = _effect;
  let type = 'takeEvery';
  let ms;
  let delayMs;

  if (Array.isArray(_effect)) {
    [effect] = _effect;
    const opts = _effect[1];
    if (opts && opts.type) {
      ({ type } = opts);
      if (type === 'throttle') {
        invariant(opts.ms, 'app.start: opts.ms should be defined if type is throttle');
        ({ ms } = opts);
      }
      if (type === 'poll') {
        invariant(opts.delay, 'app.start: opts.delay should be defined if type is poll');
        ({ delay: delayMs } = opts);
      }
    }
    invariant(
      ['watcher', 'takeEvery', 'takeLatest', 'throttle', 'poll'].indexOf(type) > -1,
      'app.start: effect type should be takeEvery, takeLatest, throttle, poll or watcher',
    );
  }

  function noop() {}

  function* sagaWithCatch(...args) {
    const { __dva_resolve: resolve = noop, __dva_reject: reject = noop } =
      args.length > 0 ? args[0] : {};
    try {
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` });
      const ret = yield effect(...args.concat(createEffects(model, opts)));
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` });
      resolve(ret);
    } catch (e) {
      onError(e, {
        key,
        effectArgs: args,
      });
      if (!e._dontReject) {
        reject(e);
      }
    }
  }

  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

  switch (type) {
    case 'watcher':
      return sagaWithCatch;
    case 'takeLatest':
      return function*() {
        yield sagaEffects.takeLatest(key, sagaWithOnEffect);
      };
    case 'throttle':
      return function*() {
        yield sagaEffects.throttle(ms, key, sagaWithOnEffect);
      };
    case 'poll':
      return function*() {
        function delay(timeout) {
          return new Promise(resolve => setTimeout(resolve, timeout));
        }
        function* pollSagaWorker(sagaEffects, action) {
          const { call } = sagaEffects;
          while (true) {
            yield call(sagaWithOnEffect, action);
            yield call(delay, delayMs);
          }
        }
        const { call, take, race } = sagaEffects;
        while (true) {
          const action = yield take(`${key}-start`);
          yield race([call(pollSagaWorker, sagaEffects, action), take(`${key}-stop`)]);
        }
      };
    default:
      return function*() {
        yield sagaEffects.takeEvery(key, sagaWithOnEffect);
      };
  }
}

function createEffects(model, opts) {
  function assertAction(type, name) {
    invariant(type, 'dispatch: action should be a plain Object with type');

    const { namespacePrefixWarning = true } = opts;

    if (namespacePrefixWarning) {
      warning(
        type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
        `[${name}] ${type} should not be prefixed with namespace ${model.namespace}`,
      );
    }
  }
  function put(action) {
    const { type } = action;
    assertAction(type, 'sagaEffects.put');
    return sagaEffects.put({ ...action, type: prefixType(type, model) });
  }

  // The operator `put` doesn't block waiting the returned promise to resolve.
  // Using `put.resolve` will wait until the promsie resolve/reject before resuming.
  // It will be helpful to organize multi-effects in order,
  // and increase the reusability by seperate the effect in stand-alone pieces.
  // https://github.com/redux-saga/redux-saga/issues/336
  function putResolve(action) {
    const { type } = action;
    assertAction(type, 'sagaEffects.put.resolve');
    return sagaEffects.put.resolve({
      ...action,
      type: prefixType(type, model),
    });
  }
  put.resolve = putResolve;

  function take(type) {
    if (typeof type === 'string') {
      assertAction(type, 'sagaEffects.take');
      return sagaEffects.take(prefixType(type, model));
    } else if (Array.isArray(type)) {
      return sagaEffects.take(
        type.map(t => {
          if (typeof t === 'string') {
            assertAction(t, 'sagaEffects.take');
            return prefixType(t, model);
          }
          return t;
        }),
      );
    } else {
      return sagaEffects.take(type);
    }
  }
  return { ...sagaEffects, put, take };
}

function applyOnEffect(fns, effect, model, key) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
