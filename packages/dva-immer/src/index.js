import produce from 'immer';

export default function() {
  return {
    _handleActions(handlers, defaultState) {
      return (state = defaultState, action) => {
        const { type } = action;
        let compatiableRet;
        const ret = produce(state, draft => {
          const handler = handlers[type];
          if (handler) {
            compatiableRet = handler(draft, action);
          }
        });
        return compatiableRet !== undefined
          ? compatiableRet
          : ret === undefined
            ? {}
            : ret;
      };
    },
  };
}
