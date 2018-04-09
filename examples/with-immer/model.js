export default {
  namespace: 'count',
  state: {
    a: {
      b: {
        c: {
          count: 0,
        },
      },
    },
  },
  reducers: {
    add(state) {
      state.a.b.c.count += 1;
    },
  },
};
