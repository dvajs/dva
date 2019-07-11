export type Action<Payload> = { type: string } & Payload;

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

export interface ActionCreator<Payload> {
  (payload: Payload): Action<Payload>;
  type: string;
};

/**
 * Creates Action Creator factory with namespace for action types.
 * @param namespace to be prepended to action types as `<namespace>/<type>`.
 */
export function createActionCreatorFactory<T_NS extends string>(namespace: T_NS) {
  const actionTypes: { [type: string]: boolean } = {};

  const base = namespace ? `${namespace}/` : '';

  function _validatePayload(_payload: any, fullType: string) {
    if (typeof _payload === 'object' && 'type' in _payload) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(`${fullType} action payload should not have \`type\` prop.`);
      }
    }
  }

  function _validateActionType(_actionType: string) {
    if (process.env.NODE_ENV !== 'production') {
      if (actionTypes[_actionType]) throw new Error(`Duplicate action type: ${_actionType}`);

      actionTypes[_actionType] = true;
    }
  }

  /**
   * Creates Action Creator
   * @param type actionType
   */
  function actionCreatorFactory<Payload>(type: string) {
    const fullType = base + type;
    _validateActionType(fullType);

    return Object.assign(
      (payload:Payload) => {
        _validatePayload(payload, fullType);

        return {
          ...payload,
          type: fullType,
        };
      },
      {
        type: fullType,
        toString: () => fullType,
      },
    );
  }

  function pollingActionCreatorFactory<Payload>(type: string) {
    const fullType = base + type;

    const startPollType = `${fullType}-start`;
    const stopPollType = `${fullType}-stop`;
    _validateActionType(startPollType);
    _validateActionType(stopPollType);

    const start = Object.assign(
      (payload: Payload) => {
        _validatePayload(payload, fullType);
        return {
          ...payload,
          type: startPollType,
        };
      },
      {
        type: startPollType,
        toString: () => startPollType,
      },
    );


    const stop = Object.assign(
      () => {
        return { type: stopPollType };
      },
      {
        type: stopPollType,
        toString: () => stopPollType,
      },
    );

    return { start, stop };
  };
  return Object.assign(actionCreatorFactory, {
    poll: pollingActionCreatorFactory,
    namespace,
  });
}

export default createActionCreatorFactory;
