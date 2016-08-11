
export default {
  namespace: 'profile',
  state: {
    name: 'sorrycc',
    age: 1,
  },
  reducers: {
    'profile/changeAge'(state, { payload }) {
      return { ...state, age: payload };
    },
  },
}
