# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)

React and redux based, lightweight and elm-style framework. (Inspired by [choo](https://github.com/yoshuawuyts/choo))

----

## Table of Contents

- [Features](#features)
- [Demos](#demos)
- [Getting Started](#getting-started)
- [Creating an App](#creating-an-app)
- [Concepts](#concepts)
- [API](#api)
- [FAQ](#faq)
- [Read More](#read-more)
- [LICENSE](#license)

## Features

- **based on redux, redux-saga and react-router:** stand on the shoulders of giants
- **small api:** only [5 methods](#api), there's not a lot to learn
- **elm cocepts:** organize model with `reducers`, `effects` and `subscriptions`
- **mobile and react-native support:** cross platform
- **dynamic model and router:** split large app and load on demand
- **plugin system:** make dva extendable, e.g. use [dva-loading](https://github.com/dvajs/dva-loading) to avoid write `showLoading` and `hideLoading` hundreds of times
- **hmr support** with [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr)
- **support typescript:** use [dva-boilerplate-typescript](https://github.com/sorrycc/dva-boilerplate-typescript) for quicking start

## Demos

- [HackerNews](https://dvajs.github.io/dva-hackernews/) ([repo](https://github.com/dvajs/dva-hackernews), [详解如何一步步实现](https://github.com/sorrycc/blog/issues/9))
- [Count](examples/count) ([jsfiddle](https://jsfiddle.net/puftw0ea/3/))
- [Popular Products](examples/popular-products)
- [Friend List](examples/friend-list)
- [User Dashboard](examples/user-dashboard)

## Getting Started

This is how dva app organized, with only 5 api. View [Count Example](examples/count) for more details.

```javascript
import dva, { connect } from 'dva';

// 1. Create app
const app = dva();

// 2. Add plugins (optionally)
app.use(plugin);

// 3. Register models
app.model(model);

// 4. Connect components and models
const App = connect(mapStateToProps)(Component);

// 5. Config router with Components
app.router(routes);

// 6. Start app
app.start('#root');
```

You can follow [Getting Started](https://github.com/dvajs/dva-docs/blob/master/v1/en-us/getting-started.md) to make a `Count App` step by step.

## Creating an App

We recommend to use [dva-cli](https://github.com/dvajs/dva-cli) for boilerplating your app.

```bash
// Install dva-cli
$ npm install dva-cli -g

// Create app and start
$ dva new myapp
$ cd myapp
$ npm install
$ npm start
```

But if you like [create-react-app](https://github.com/facebookincubator/create-react-app), feel free to read [Creating dva app with create-react-app](https://github.com/dvajs/dva/issues/58#issuecomment-243435470).

## Concepts

View [Concepts](https://github.com/dvajs/dva-docs/blob/master/v1/en-us/concepts.md) for detail explain on Model, State, Action, dispatch, Reducer, Effect, Subscription, Router and Route Components.

<img src="https://zos.alipayobjects.com/rmsportal/PPrerEAKbIoDZYr.png" width="807" />

## API

### `app = dva(opts)`

Initialize a new `dva` app. Takes an optional object of handlers that is passed to [app.use](#appusehooks). Besides, you can config `history` and `initialState` here.

- `opts.history:` the history for router, default: `hashHistory`
- `opts.initialState:` initialState of the app, default: `{}`

If you want to use `browserHistory` instead of `hashHistory`:

```javascript
import { browserHistory } from 'dva/router';
const app = dva({
  history: browserHistory,
});
```

### `app.use(hooks)`

Register an object of hooks on the application. 

Support these `hooks`:

- `onError(fn):` called when an `effect` or `subscription` emit an error
- `onAction(array|fn):` called when an `action` is dispatched, used for registering redux middleware, support `Array` for convenience
- `onStateChange(fn):` called after a reducer changes the `state`
- `onReducer(fn):` used for apply reducer enhancer
- `onEffect(fn):` used for wrapping effect to add custom behavior, e.g. [dva-loading](https://github.com/dvajs/dva-loading) for automatical loading state
- `onHmr(fn):` used for hot module replacement
- `extraReducers(object):` used for adding extra reducers, e.g. [redux-form](https://github.com/erikras/redux-form) needs extra `form` reducer

### `app.model(obj)`

Create a new model. Takes the following arguments:

- **namespace:** namespace the model
- **state:** initial value
- **reducers:** synchronous operations that modify state. Triggered by `actions`. Signature of `(state, action) => state`, same as Redux.
- **effects:** asynchronous operations that don't modify state directly. Triggered by `actions`, can call `actions`. Signature of `(action, { put, call, select  })`,
- **subscriptions:** asynchronous read-only operations that don't modify state directly. Can call `actions`. Signature of `({ dispatch, history })`.

**put(action)** in effects, and **dispatch(action)** in subscriptions

Send a new action to the models. `put` in effects is the same as `dispatch` in subscriptions.

e.g.

```javascript
yield put({
  type: actionType,
  payload: attachedData,
  error: errorIfHave
});
```

or 

```javascript
dispatch({
  type: actionType,
  payload: attachedData,
  error: errorIfHave
});
```

When dispatch action inside a `model`, we don't need to add namespace prefix. And if ouside a `model`, we should add namespace separated with a `/`, e.g. `namespace/actionType`.

**call(asyncFunction)**

Call async function. Support promise.

e.g.

```javascript
const result = yield call(api.fetch, { page: 1 });
```

**select(function)**

Select data from global state.

e.g.

```javascript
const count = yield select(state => state.count);
```

A typical model example:

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
    // Monitor keyboard input
    keyboard({ dispatch }) {
      return key('ctrl+up', () => { dispatch({ type: 'addDelay'}); });
    },
  },
});
```

And [another complex model example](https://github.com/dvajs/dva-hackernews/blob/master/src/models/item/index.js) from dva-hackernews.

### `app.router(({ history }) => routes)`

Config router. Takes a function with arguments `{ history }`, and expects `router` config. It use the same api as react-router, return jsx elements or JavaScript Object for dynamic routing.

e.g.

```javascript
import { Router, Route } from 'dva/routes';
app.router(({ history } => ({
  <Router history={ history }>
    <Route path="/" component={App} />
  </Router>
});
```

More on [react-router/docs](https://github.com/reactjs/react-router/tree/master/docs).

### `app.start(selector?)`

Start the application. `selector` is optional. If no `selector` arguments, it will return a function that return JSX elements.

## Installation

```bash
$ npm install dva
```

## FAQ

### Why is it called dva?

dva is a [hero](http://ow.blizzard.cn/heroes/dva) from overwatch. She is beautiful and cute, and `dva` is the shortest and available one on npm when creating it.

### Which packages was dva built on?

- views: [react](https://github.com/facebook/react)
- models: [redux](https://github.com/reactjs/redux), [react-redux](https://github.com/reactjs/react-redux), [redux-saga](https://github.com/yelouafi/redux-saga)
- router: [react-router](https://github.com/reactjs/react-router)
- http: [whatwg-fetch](https://github.com/github/fetch)

### Is it production ready?

Sure.

### Does it support IE8?

No.

### Does it support react-native?

Yes. Try to get started with [dva-example-react-native](https://github.com/sorrycc/dva-example-react-native).

## Read More

- [dva Knowledgemap](https://github.com/dvajs/dva-knowledgemap) - All knowledge points needed to create a dva app.
- [dva 简介：Why dva and What's dva](https://github.com/dvajs/dva/issues/1)
- [教程：教你如何一步步完成一个中型应用](https://github.com/dvajs/dva-docs/blob/master/v1/zh-cn/tutorial/01-%E6%A6%82%E8%A6%81.md)
- [升级文档：Upgrade to 1.0.0](https://github.com/dvajs/dva/pull/42#issuecomment-241323617)
- [支付宝前端应用架构的发展和选择: 从 roof 到 redux 再到 dva](https://github.com/sorrycc/blog/issues/6)
- [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)
- [从 0 开始实现 react 版本的 hackernews (基于 dva)](https://github.com/sorrycc/blog/issues/9)

## License

[MIT](https://tldrlegal.com/license/mit-license)
