# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)

Lightweight elm-style framework based on react and redux.

----

## Documents

基础：

- [快速上手](https://github.com/dvajs/dva-docs/blob/master/zh/%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B.md)
- [基本概念](https://github.com/dvajs/dva-docs/blob/master/zh/concepts/01-%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5.md)
- [API](#api)
- [Demos](#demos)
- [dva 简介：Why dva and What's dva](https://github.com/dvajs/dva/issues/1)
- [教程：教你如何一步步完成一个中型应用](https://github.com/dvajs/dva-docs/blob/master/zh/tutorial/01-%E6%A6%82%E8%A6%81.md)
- [升级文档：Upgrade to 1.0.0-beta1](https://github.com/dvajs/dva/pull/42#issuecomment-241323617)

扩展阅读：

- [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1) (dva 基于此封装)
- [subscription 及其适用场景](https://github.com/dvajs/dva/issues/3#issuecomment-229250708)
- [支付宝前端应用架构的发展和选择: 从 roof 到 redux 再到 dva](https://github.com/sorrycc/blog/issues/6)
- [从 0 开始实现 react 版本的 hackernews (基于 dva)](https://github.com/sorrycc/blog/issues/9)
- [使用 create-react-app 开发 dva 应用](https://github.com/dvajs/dva/issues/58#issuecomment-243435470)

## Features

- **based on redux, redux-saga and react-router**
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
- `onEffect(Function):` 封装 effect 方法的处理，比如可以实现自动切换 loading 状态
- `onHmr(render => {}):` 提供 render 方法用于重新渲染 routes 和 components，暂还不支持 model
- `extraReducers(Object):` 提供额外的 reducers，比如 [redux-form](https://github.com/erikras/redux-form) 需要全局 reducer `form`

### `app.model(obj)`

Create a new model. Takes the following arguments:

- **namespace:** 通过 namespace 访问其他 model 上的属性，不能为空
- **state:** 初始值
- **reducers:** 同步操作，用于更新数据，由 `action` 触发
- **effects:** 异步操作，处理各种业务逻辑，不直接更新数据，由 `action` 触发，可以 dispatch `action`
- **subscriptions:** 异步只读操作，不直接更新数据，可以 dispatch `action`

一个典型的 model ：

```javascript
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1; },
    minus(state) { return state - 1; },
  },
  effects: {
    *addDelay(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
    },
  },
  subscriptions: {
    // 监听键盘事件，在点击 ctrl + up 时，触发 addDelay action
    keyboard({ dispatch }) {
      return key('ctrl+up', () => { dispatch({ type: 'addDelay'}); });
    },
  },
});
```

`reducers` 来自 redux，格式为 `(state, action) => state`，详见 [Reducers@redux.js.org](http://redux.js.org/docs/basics/Reducers.html)，但不支持 combineReducer 。

`effects` 是 side effects，用于存放异步逻辑，底层引入了 [redux-sagas](https://github.com/yelouafi/redux-saga) 做异步流程控制，通过 [generator](http://www.ruanyifeng.com/blog/2015/04/generator.html) 把异步转换成同步写法。格式为 `*(action, effects) => {}`。

`subscriptions` 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。格式为 `({ dispatch, history }) => unsubscribe` 。

### `app.router(({ history }) => routes)`

创建路由。不做封装，使用和 react-router 相同的配置，可用 jsx 格式，也可用 javascript object 的格式支持动态路由。

详见：[react-router/docs](https://github.com/reactjs/react-router/tree/master/docs)

### `app.start(selector?)`

Start the application. 如果没有传入 `selector`，则返回 React Element，可用于 SSR，react-native, 国际化等等。

## FAQ

### Why is it called dva?

dva is a [hero](http://ow.blizzard.cn/heroes/dva) from overwatch. She is beautiful and cute, and `dva` is the shortest one that is available on npm.

### Is it production ready?

Yes.

## License

[MIT](https://tldrlegal.com/license/mit-license)
