# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)

Front-end framework based on react, redux, react-redux, react-router and redux-saga, inspired by elm and choo.

----

## Documents

- [dva 简介](https://github.com/sorrycc/dva/issues/1)
- [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1) (dva 基于此封装)
- [subscription 及其适用场景](https://github.com/sorrycc/dva/issues/3#issuecomment-229250708)
- [支付宝前端应用架构的发展和选择: 从 roof 到 redux 再到 dva](https://github.com/sorrycc/blog/issues/6)

## Getting Started

### Install

```bash
$ npm install --save dva
```

### Usage Example

Let's create an count app that changes when user click the + or - button. 

```javascript
import React from 'react';
import dva, { connect } from 'dva';
import { Router, Route } from 'dva/router';

// 1. Initialize
const app = dva();

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    ['count/add'  ](count) { return count + 1 },
    ['count/minus'](count) { return count - 1 },
  },
});

// 3. View
const App = connect(({ count }) => ({
  count
}))(function(props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count/add'})}}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count/minus'})}}>-</button>
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
```

## Examples

- [Count](./examples/count)
- [Popular Products](./examples/popular-products)
- [Friend List](./examples/friend-list)
- [User Dashboard](./examples/user-dashboard)

## License

[MIT](https://tldrlegal.com/license/mit-license)
