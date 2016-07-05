import './index.html';
import React from 'react';
import dva, { connect } from 'dva';
import { put, call } from 'dva/effects';
import { Router, Route } from 'dva/router';
import fetch from 'dva/fetch';
import ProductList from './components/ProductList/ProductList';
import styles from './index.less';

// 1. Initialize
const app = dva();

// 2. Model
app.model({
  namespace: 'products',
  state: {
    list: [],
    loading: false,
  },
  subscriptions: [
    function(dispatch) {
      dispatch({type: 'products/query'});
    },
  ],
  effects: {
    ['products/query']: function*() {
      const { success, data } = yield fetch(`/api/products`).then(res => res.json());
      if (success) {
        yield put({
          type: 'products/query/success',
          payload: data,
        });
      }
    },
    ['products/vote']: function*({ payload }) {
      const { success } = yield fetch(`/api/products/vote?id=${payload}`).then(res => res.json());
      if (success) {
        yield put({
          type: 'products/vote/success',
          payload,
        });
      }
    },
  },
  reducers: {
    ['products/query'](state) {
      return { ...state, loading: true, };
    },
    ['products/query/success'](state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
    ['products/vote'](state) {
      return { ...state, loading: true };
    },
    ['products/vote/success'](state, { payload }) {
      const newList = state.list.map(product => {
        if (product.id === payload) {
          return { ...product, vote:product.vote + 1 };
        } else {
          return product;
        }
      });
      return { ...state, list: newList, loading: false };
    },
  },
});

// 3. View
const App = connect(({products}) => ({
  products
}))(function(props) {
  return (
    <div className={styles.productPage}>
      <h2>Popular Products</h2>
      <ProductList
        data={props.products.list}
        loading={props.products.loading}
        dispatch={props.dispatch}
      />
    </div>
  );
});

// 4. Router
app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={App} />
  </Router>
);

// 5. Start
app.start('root');
