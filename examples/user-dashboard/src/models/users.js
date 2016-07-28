import { take, call, put, fork, cancel, select } from 'dva/effects';
import { hashHistory } from 'dva/router';
import { message } from 'antd';
import { create, remove, update, query } from '../services/users';

export default {

  namespace: 'users',

  state: {
    list: [],
    loading: false,
    total: null,
    current: null,
    currentItem: {},
    modalVisible: false,
    modalType: 'create',
  },

  subscriptions: [
    function(dispatch) {
      hashHistory.listen(location => {
        if (location.action === 'POP' && location.pathname === '/users') {
          dispatch({
            type: 'users/query',
            payload: location.query,
            pop: true,
          });
        }
      });
    },
  ],

  effects: {
    *['users/query']({ payload, pop }) {
      throw new Error('111');
      try {
        const routing = yield select(({ routing }) => routing);
        const newQuery = {
          ...routing.locationBeforeTransitions.query,
          page: undefined,
          ...payload,
        };

        if (!pop) {
          yield call(hashHistory.push, {
            pathname: '/users',
            query: newQuery,
          });
        }

        yield put({ type: 'users/showLoading' });
        const { jsonResult } = yield call(query, newQuery);
        if (jsonResult) {
          yield put({
            type: 'users/query/success',
            payload: {
              list: jsonResult.data,
              total: jsonResult.page.total,
              current: jsonResult.page.current,
            },
          });
        }
      } catch (err) {
        message.error(err);
      }
    },
    *['users/delete']({ payload }) {
      try {
        yield put({ type: 'users/showLoading' });
        const { jsonResult } = yield call(remove, { id: payload });
        if (jsonResult && jsonResult.success) {
          yield put({
            type: 'users/delete/success',
            payload,
          });
        }
      } catch (err) {
        message.error(err);
      }
    },
    *['users/create']({ payload }) {
      try {
        yield put({ type: 'users/hideModal' });
        yield put({ type: 'users/showLoading' });
        const { jsonResult } = yield call(create, payload);
        if (jsonResult && jsonResult.success) {
          yield put({
            type: 'users/create/success',
            payload,
          });
        }
      } catch (err) {
        message.error(err);
      }
    },
    *['users/update']({ payload }) {
      try {
        yield put({ type: 'users/hideModal' });
        yield put({ type: 'users/showLoading' });
        const id = yield select(({ users }) => users.currentItem.id);
        const newUser = { ...payload, id };
        const { jsonResult } = yield call(update, newUser);
        if (jsonResult && jsonResult.success) {
          yield put({
            type: 'users/update/success',
            payload: newUser,
          });
        }
      } catch (err) {
        message.error(err);
      }
    },
  },

  reducers: {
    ['users/showLoading'](state, action) {
      return { ...state, loading: true };
    },
    ['users/create/success'](state, action) {
      const newUser = action.payload;
      return { ...state, list: [newUser, ...state.list], loading: false };
    },
    ['users/delete/success'](state, action) {
      const id = action.payload;
      const newList = state.list.filter(user => user.id !== id);
      return { ...state, list: newList, loading: false };
    },
    ['users/update/success'](state, action) {
      const updateUser = action.payload;
      const newList = state.list.map(user => {
        if (user.id === updateUser.id) {
          return { ...user, ...updateUser };
        }
        return user;
      });
      return { ...state, list: newList, loading: false };
    },
    ['users/query/success'](state, action) {
      return { ...state, ...action.payload, loading: false };
    },
    ['users/showModal'](state, action) {
      return { ...state, ...action.payload, modalVisible: true };
    },
    ['users/hideModal'](state, action) {
      return { ...state, modalVisible: false };
    },
  },

}
