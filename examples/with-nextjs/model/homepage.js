const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

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
  },
  effects: {
    *init(action, { put }) {
      yield delay(2000);
      yield put({ type: 'caculate', delta: 1 });
    },
  },
};

export default model;

