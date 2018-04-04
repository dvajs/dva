import produce from 'immer';

export default function() {
  return {
    _handleActions(handlers, defaultState) {
      return (state = defaultState, action) => {
        const { type } = action;
        const ret = produce(state, draft => {
          const handler = handlers[type];
          if (handler) {
            handler(draft, action);
          }
        });
        return ret === undefined ? {} : ret;
      };
    },
  };
}
