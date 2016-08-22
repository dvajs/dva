# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/sorrycc/dva.svg?style=flat)](https://travis-ci.org/sorrycc/dva)
[![Coverage Status](https://img.shields.io/coveralls/sorrycc/dva.svg?style=flat)](https://coveralls.io/r/sorrycc/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)

Lightweight elm-style framework based on react and redux.

----

## Documents

- [dva 入门：手把手教你写应用](https://github.com/sorrycc/blog/issues/8)
- [dva 简介](https://github.com/dvajs/dva/issues/1)
- [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1) (dva 基于此封装)
- [subscription 及其适用场景](https://github.com/dvajs/dva/issues/3#issuecomment-229250708)
- [支付宝前端应用架构的发展和选择: 从 roof 到 redux 再到 dva](https://github.com/sorrycc/blog/issues/6)

## Features

- based on redux, redux-saga and react-router
- **small api:** only 5 methods
- **transparent side effects:** using effects and subscriptions brings clarity to IO
- **mobile and react-native support:** don't need router
- **dynamic model and router:** split large scale app on demand
- **plugin system:** with hooks
- **hmr support:** components and routes is ready

## Demos

- [HackerNews](https://dvajs.github.io/dva-hackernews/) ([repo](https://github.com/dvajs/dva-hackernews), [intro](https://github.com/sorrycc/blog/issues/9))
- [Count](./examples/count) ([jsfiddle](https://jsfiddle.net/puftw0ea/))
- [Popular Products](./examples/popular-products)
- [Friend List](./examples/friend-list)
- [User Dashboard](./examples/user-dashboard)

## Getting Started

### Install

```bash
$ npm install --save dva
```

### Example

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
    add  (count) { return count + 1 },
    minus(count) { return count - 1 },
  },
});

// 3. View
const App = connect(({ count }) => ({
  count
}))(function(props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={()   => { props.dispatch({type: 'count/add'})}}>+</button>
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
app.start('#root');
```

## API

### `app = dva(opts)`

Initialize a new `dva` app. opts 里除 `history` 和 `initialState` 外会被传递给 [app.use](#appusehooks) .

- `opts.history:` default: `hashHistory`
- `opts.initialState:` default: `{}`

`opts.history` 是给路由用的 history，支持 hashHistory 和 browserHistory 。默认 hashHistory，要换成 browserHistory 可以这样：

```javascript
import { browserHistory } from 'dva/router';
const app = dva({
  history: browserHistory,
});
```

`opts.initialState` 是给 store 的初始值，优先级高于 model 里的 state 。

### `app.use(hooks)`

dva 的插件机制是通过 hooks 实现的，用于添加自定义行为和监听器。

目前支持以下 hooks :

- `onError(err => {}):` effects 和 subscriptions 出错时触发
- `onAction(Array|Function):` 等同于 redux middleware，支持数组
- `onStateChange(listener):` 绑定 listner，state 变化时触发
- `onReducer(reducerEnhancer):` 应用全局的 reducer enhancer，比如 [redux-undo](https://github.com/omnidan/redux-undo)
- `onHmr(render => {}):` 提供 render 方法用于重新渲染 routes 和 components，暂还不支持 model
- `extraReducers(obj):` 提供额外的 reducers，比如 [redux-form](https://github.com/erikras/redux-form) 需要全局 reducer `form`

### `app.model(obj)`

Create a new model. Takes the following arguments:

- **namespace:** 通过 namespace 访问其他 model 上的属性，不能为空
- **state:** 初始值
- **reducers:** 同步操作，用于更新数据，由 `action` 触发
- **effects:** 异步操作，处理各种业务逻辑，不直接更新数据，由 `action` 触发，可以 dispatch `action`
- **subscriptions:** 异步只读操作，不直接更新数据，可以 dispatch `action`

### `app.router(({ history }) => routes)`

创建路由。使用和 react-router 相同的配置，不做封装，可用 jsx 格式，也可用 javascript object 的格式支持动态路由。

详见：[react-router/docs](https://github.com/reactjs/react-router/tree/master/docs)

### `app.start(selector?)`

Start the application. 如果没有传入 `selector`，则返回 React Element，可用于 SSR，react-native, 国际化等等。

## FAQ

### Why is it called dva?

dva is a hero from [overwatch](http://ow.blizzard.cn/heroes/dva). She is cute, and `dva` is the shortest one that is available on npm.

### Is it production ready?

Yes.

## License

[MIT](https://tldrlegal.com/license/mit-license)
