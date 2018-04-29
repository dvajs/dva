# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

[View README in English](README.md)

Be based on [redux](https://github.com/reactjs/redux)、[redux-saga](https://github.com/redux-saga/redux-saga) and [react-router](https://github.com/ReactTraining/react-router) Lightweight front end frame.(Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## Concept

* **Simple use**：Only 6 API, especially friendly to Redux users
* **elm concept**： `reducers`, `effects` , `subcriptions` make model
* **Support mobile and react-native**：cross platform ([react-native Example](https://github.com/sorrycc/dva-example-react-native))
* **Support HMR**：Be based on [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr) support components、routes 和 models 的 HMR
* **Dynamic loading Model and Routing**：Lazy loading mode quicker access speed. ([Example](https://github.com/dvajs/dva/blob/master/packages/dva-example-user-dashboard/src/router.js))
* **Plug-in mechanism**：such as [dva-loading](https://github.com/dvajs/dva/tree/master/packages/dva-loading) automatic processing loading state，not repeated showLoading or  hideLoading
* **A perfect syntactic analysis library [dva-ast](https://github.com/dvajs/dva-ast)**：[dva-cli](https://github.com/dvajs/dva-cli) Based on this, intelligent creation is implemented model and router....
* **Support TypeScript**：adopt d.ts ([Example](https://github.com/sorrycc/dva-boilerplate-typescript))

## Why use dva ?

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [Alipay front application architecture development and selection](https://www.github.com/sorrycc/blog/issues/6)

## Demos

* [Count](https://stackblitz.com/edit/dva-example-count):Simple counter
* [User Dashboard](https://github.com/dvajs/dva/tree/master/packages/dva-example-user-dashboard): User management
* [HackerNews](https://github.com/dvajs/dva-hackernews):  ([Demo](https://dvajs.github.io/dva-hackernews/))，HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin): ([Demo](http://antd-admin.zuiidea.com/))，Background management application based on antd and DVA
* [github-stars](https://github.com/sorrycc/github-stars): ([Demo](http://sorrycc.github.io/github-stars/#/?_k=rmj86f))，Github Star management application
* [react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter): React Native example that integrates DVA and react-navigation typical application scenarios
* [dva-example-nextjs](https://github.com/dvajs/dva/tree/master/packages/dva-example-nextjs): Integrate with next.js
* [Account System](https://github.com/yvanwangl/AccountSystem.git): Small inventory management system

## Quick Start

[12 steps and 30 minutes to complete user managed CURD application. (react+dva+antd)](https://github.com/sorrycc/blog/issues/18)

## FAQ

### The reason for the naming ?

> D.Va It has a powerful machine armor, which has two fully automatic close range fusion guns, a propeller that can make the machine leap to an enemy or an obstacle, and a defense matrix that can resist a long distance attack from the front.

—— Come from [Overwatch](http://ow.blizzard.cn/heroes/dva) 。

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### Can it be used in the production environment?

Yes, it can be used

### Do you support IE8?

I won't support it

## Next step

The following can help you better understand and use DVA：

* Understanding DVA [8 concepts](https://github.com/dvajs/dva/blob/master/docs/Concepts_zh-CN.md) And how they're strung together
* Mastering DVA [ all API](https://github.com/dvajs/dva/blob/master/docs/API_zh-CN.md)
* Look at the [dva knowledge map](https://github.com/dvajs/dva-knowledgemap) all the basic knowledge, such as ES6, React, DVA, and so on
* Look at [more FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)Look at what other people usually have.
* If you create projects based on dva-cli, you'd better know him.[collocation method](https://github.com/sorrycc/roadhog#配置)


## License

[MIT](https://tldrlegal.com/license/mit-license)
