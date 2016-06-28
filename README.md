# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)

Front-end framework based on react, redux, react-redux, react-router and redux-saga, inspired by elm and choo.

----

## Documents

- [dva 简介](https://github.com/sorrycc/dva/issues/1)

## Quick Start

Let's create an count app that changes when user click the + or - button. 

```javascript
import React from 'react';
import dva, { connect } from 'dva';
import { Route } from 'dva/router';

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
const Count = ({ count, dispatch }) =>
  <div>
    <h2>{ count }</h2>
    <button key="add" onClick={() => { dispatch({type: 'count/add'})}}>+</button>
    <button key="minus" onClick={() => { dispatch({type: 'count/minus'})}}>-</button>
  </div>
const HomePage = connect(({ count }) => ({ count }))(Count);

// 4. Router
app.router(
  <Route path="/" component={HomePage} />
);

// 5. Start
app.start('root');
```

## Examples

- [Count](./examples/count)
- [Popular Products](./examples/popular-products)

## License

[MIT](https://tldrlegal.com/license/mit-license)
