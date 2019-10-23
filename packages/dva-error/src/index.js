const SET_ERROR = '@@DVA_ERROR/SET_ERROR';
const NAMESPACE = 'error';

function createLoading(opts = {}) {
  const namespace = opts.namespace || NAMESPACE;

  const { only = [], except = [] } = opts;
  if (only.length > 0 && except.length > 0) {
    throw Error('It is ambiguous to configurate `only` and `except` items at the same time.');
  }

  const initialState = {
    global: [],
    models: {},
    effects: {},
  };

  const extraReducers = {
    [namespace](state = initialState, { type, payload }) {
      const { namespace, actionType, error } = payload || {};
      if (type === SET_ERROR) {
        const effects = { ...state.effects, [actionType]: error };
        const models = {
          ...state.models,
          [namespace]: Object.keys(effects)
            .map(actionType => {
              const _namespace = actionType.split('/')[0];
              if (_namespace !== namespace) return undefined;
              return effects[actionType];
            })
            .filter(v => !!v),
        };
        const global = Object.keys(models)
          .reduce((acc, cv) => {
            return acc.concat(models[cv]);
          }, [])
          .filter(v => !!v);
        return {
          ...state,
          global,
          models,
          effects,
        };
      }
      return state;
    },
  };

  function onEffect(effect, { put }, model, actionType) {
    const { namespace } = model;
    if (
      (only.length === 0 && except.length === 0) ||
      (only.length > 0 && only.indexOf(actionType) !== -1) ||
      (except.length > 0 && except.indexOf(actionType) === -1)
    ) {
      return function*(...args) {
        try {
          yield put({ type: SET_ERROR, payload: { namespace, actionType, error: undefined } });
          yield effect(...args);
        } catch (error) {
          yield put({ type: SET_ERROR, payload: { namespace, actionType, error } });
        }
      };
    } else {
      return effect;
    }
  }

  return {
    extraReducers,
    onEffect,
  };
}

export default createLoading;
