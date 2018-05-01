export default {
  namespace: 'counter',
  state: 0,
  reducers: {
    add(state) {
      return state + 1;
    },
    minus(state) {
      return state - 1;
    },
  },
};
