import { call, put, select } from 'dva/effects';
import { hashHistory } from 'dva/router';
import { message } from 'antd';
import { create, remove, update, query } from '../services/users';

export default {

  namespace: 'users',

  state: {
    list: [],
    loading: false,
    total: null,
    current: 1,
    currentItem: {},
    modalVisible: false,
    modalType: 'create'
  },

  subscriptions: [
    function (dispatch) {
      hashHistory.listen(location => {
        if (location.pathname === '/users') {
          dispatch({
            type: 'users/query',
            payload: location.query
          });
        }
      });
    }
  ],

  effects: {
    *['users/query']({ payload }) {
      const route = yield select(({ routing }) => routing);
      console.log(route);
      let routerQuery = {};
      if (route && route.locationBeforeTransitions && route.locationBeforeTransitions.query) {
        routerQuery = {...route.locationBeforeTransitions.query};
      }

      if (!routerQuery.keyword) {
        delete routerQuery.keyword;
        delete routerQuery.field;
      }

      const newQuery = {
        ...routerQuery,
        page: 1,
        ...payload
      };

      yield call(hashHistory.push, {
        pathname: '/users',
        query: newQuery
      });

      yield put({ type: 'users/showLoading' });
      const { data } = yield call(query, newQuery);
      if (data) {
        yield put({
          type: 'users/query/success',
          payload: {
            list: data.data,
            total: data.page.total,
            current: data.page.current
          }
        });
      }
    },
    *['users/delete']({ payload }) {
      yield put({ type: 'users/showLoading' });
      const { data } = yield call(remove, { id: payload });
      if (data && data.success) {
        yield put({
          type: 'users/delete/success',
          payload
        });
      }
    },
    *['users/create']({ payload }) {
      yield put({ type: 'users/hideModal' });
      yield put({ type: 'users/showLoading' });
      const { data } = yield call(create, payload);
      if (data && data.success) {
        yield put({
          type: 'users/create/success',
          payload
        });
      }
    },
    *['users/update']({ payload }) {
      yield put({ type: 'users/hideModal' });
      yield put({ type: 'users/showLoading' });
      const id = yield select(({ users }) => users.currentItem.id);
      const newUser = { ...payload, id };
      const { data } = yield call(update, newUser);
      if (data && data.success) {
        yield put({
          type: 'users/update/success',
          payload: newUser
        });
      }
    }
  },

  reducers: {
    ['users/showLoading'](state) {
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
    ['users/hideModal'](state) {
      return { ...state, modalVisible: false };
    }
  }

};
