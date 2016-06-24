import "babel-polyfill";
import React from 'react';
import dva, { connect } from 'dva';
import { put, call } from 'dva/effects';
import { Route } from 'dva/router';

const app = dva();

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
      yield call(delay(800));
      yield put({
        type: 'products/query/success',
        payload: ['ant-tool', 'roof'],
      });
    },
  },
  reducers: {
    ['products/query'](state) {
      return { ...state, loading: true, };
    },
    ['products/query/success'](state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
  },
});

const MainView = connect(({products}) => ({products}))(ProductList);

app.router(
  <Route path="/" component={MainView} />
);

app.start('root');

///////////////////
// Utils

function delay(timeout) {
  return () => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  };
}

///////////////////
// Components

function ProductList(props) {
  return (
    <div>
      <h2>Popular Products</h2>
      {
        props.products.loading ? 'loading' :
          props.products.list.map((product, index) => (
            <li key={index}>{product}</li>
          ))
      }
    </div>
  );
}
