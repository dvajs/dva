
export default {
  namespace: 'profile',
  state: {
    name: 'sorrycc',
    age: 1,
  },
  reducers: {
    'changeAge'(state, { payload }) {
      return { ...state, age: payload };
    },
  },
}
