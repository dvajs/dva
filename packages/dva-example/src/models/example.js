
export default {

  namespace: 'example',

  state: {
    a:1
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, a:state.a + 1 };
    },
  },
  epics: {
    getapp(action$,store,{ajax,Observable}){
      return action$.ofType('example/getapp')
      .switchMap(action=>{
        return Observable
        .interval(1000)
        .throttleTime(2000)
        .map(n => n * 2)
        .subscribe((e)=>{
          store.dispatch({type:'example/save',payload:e})
        })
      })
    }
  }
};
