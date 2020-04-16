import produce from 'immer';

export default function() {
  return {
    _handleActions(handlers, defaultState) {
      return (state = defaultState, action) => {
        const { type } = action;

        const ret = produce(state, draft => {
          const handler = handlers[type];
          if (handler) {
            const compatibleRet = handler(draft, action);
            if (compatibleRet !== undefined) {
              // which means you are use redux pattern
              // it's compatible. https://github.com/mweststrate/immer#returning-data-from-producers
              return compatibleRet;
            }
          }
        });
        return ret === undefined ? {} : ret;
      };
    },
  };
}
