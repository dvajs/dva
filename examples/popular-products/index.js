import './index.html';
import React from 'react';
import dva from '../../src/index';
import { connect } from '../../index';
import { Router, Route, useRouterHistory } from '../../router';
import fetch from '../../fetch';
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
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' });
    },
  },
  effects: {
    *query(_, { put }) {
      const { success, data } = yield fetch(`/api/products`).then(res => res.json());
      if (success) {
        yield put({
          type: 'querySuccess',
          payload: data,
        });
      }
    },
    *vote({ payload }, { put}) {
      const { success } = yield fetch(`/api/products/vote?id=${payload}`).then(res => res.json());
      if (success) {
        yield put({
          type: 'voteSuccess',
          payload,
        });
      }
    },
  },
  reducers: {
    query(state) {
      return { ...state, loading: true, };
    },
    querySuccess(state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
    vote(state) {
      return { ...state, loading: true };
    },
    voteSuccess(state, { payload }) {
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
app.start('#root');
