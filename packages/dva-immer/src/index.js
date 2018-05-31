import produce from 'immer';

export default function() {
  return {
    _handleActions(handlers, defaultState) {
      return (state = defaultState, action) => {
        const { type } = action;

        const ret = produce(state, draft => {
          const handler = handlers[type];
          if (handler) {
            const compatiableRet = handler(draft, action);
            if (compatiableRet !== undefined) {
              // which means you are use redux pattern
              // it's compatiable. https://github.com/mweststrate/immer#returning-data-from-producers
              return compatiableRet;
            }
          }
        });
        return ret === undefined ? {} : ret;
      };
    },
  };
}
