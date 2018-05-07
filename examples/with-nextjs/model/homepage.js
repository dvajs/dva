const model = {
  namespace: 'index',
  state: {
    name: 'hopperhuang',
    count: 0,
    init: false,
  },
  reducers: {
    caculate(state, payload) {
      const { count } = state;
      const { delta } = payload;
      return { ...state, count: count + delta };
    },
    changeInitStatus(state) {
      return { ...state, init: true };
    },
  },
  effects: {
    // two usage
    // first:  init data in server side;
    // second: init data in client side for sync data between to sides
    *initData({ delta }, { put, select }) {
      const index = yield select(state => state.index);
      const { init } = index;
      // once init will not be called second time
      if (!init) {
        yield put({ type: 'caculate', delta });
        yield put({ type: 'changeInitStatus' });
      }
    },
  },
};

export default model;

