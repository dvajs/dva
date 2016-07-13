# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/sorrycc/dva.svg?style=flat)](https://travis-ci.org/sorrycc/dva)
[![Coverage Status](https://img.shields.io/coveralls/sorrycc/dva.svg?style=flat)](https://coveralls.io/r/sorrycc/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)

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
app.start(document.getElementById('root'));
```

## Examples

- [Count](./examples/count) ([jsfiddle](https://jsfiddle.net/puftw0ea/))
- [Popular Products](./examples/popular-products)
- [Friend List](./examples/friend-list)
- [User Dashboard](./examples/user-dashboard)

## FAQ

### dva 命名的来历 ?

dva 是守望先锋 (overwatch) 里的[英雄](http://ow.blizzard.cn/heroes/dva)。我喜欢使用这个角色，拥有强大的机甲，是个坚实的肉盾，并且她是唯一背景是真实的电竞选手，来自韩国。

## License

[MIT](https://tldrlegal.com/license/mit-license)
