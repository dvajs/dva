# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

[以中文查看](./README_zh-CN.md)

Lightweight front-end framework based on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/yelouafi/redux-saga) and [react-router@2.x](https://github.com/ReactTraining/react-router/tree/v2.8.1). (Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## Features

* **Easy to learn, easy to use**: only 6 apis, very friendly to redux users
* **Elm concepts**: organize models with `reducers`, `effects` 和 `subscriptions`
* **Support mobile and react-native**: cross platform ([ReactNative Example](https://github.com/sorrycc/dva-example-react-native))
* **Support HMR**: support HMR for components, routes and models with [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr)
* **Support load model and routes dynamically**: Improve performance ([Example](https://github.com/dvajs/dva/tree/master/examples/dynamic-load))
* **Plugin system**: e.g. we have [dva-loading](https://github.com/dvajs/dva-loading) plugin to handle loading state automatically
* **Support TypeScript**：with d.ts ([Example](https://github.com/sorrycc/dva-boilerplate-typescript))

## Why dva ?

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [支付宝前端应用架构的发展和选择](https://www.github.com/sorrycc/blog/issues/6)

## Demos

* [Count](https://github.com/dvajs/dva/blob/master/examples/count) ([jsfiddle](https://jsfiddle.net/puftw0ea/3/)): Simple count example
* [User Dashboard](https://github.com/dvajs/dva-example-user-dashboard): User management dashboard
* [HackerNews](https://github.com/dvajs/dva-hackernews)  ([Demo](https://dvajs.github.io/dva-hackernews/)): HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin) ([Demo](http://zuiidea.github.io/antd-admin/)): Admin dashboard based on antd and dva

## Quick Start

- [Getting Started](https://github.com/dvajs/dva/blob/master/docs/GettingStarted.md)
- [12 步 30 分钟，完成用户管理的 CURD 应用 (react+dva+antd)](https://github.com/sorrycc/blog/issues/18)

## FAQ

### Why is it called dva?

> D.Va’s mech is nimble and powerful — its twin Fusion Cannons blast away with autofire at short range, and she can use its Boosters to barrel over enemies and obstacles, or deflect attacks with her projectile-dismantling Defense Matrix.

—— From [OverWatch](http://ow.blizzard.cn/heroes/dva)

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### Is it production ready?

Sure! We have 100+ projects used with dva, both in Alibaba and out.

### Is it support IE8?

No.

## Next

Some basic articles.

* Familiar with the [8 Conpects](https://github.com/dvajs/dva/blob/master/docs/Concepts.md), and know how they are connected together
* Know all [dva APIs](https://github.com/dvajs/dva/blob/master/docs/API.md)
* Checkout [dva knowledgemap](https://github.com/dvajs/dva-knowledgemap), including all the basic knowledge with ES6, React, dva
* Checkout [more FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)
* If your project is created with [dva-cli](https://github.com/dvajs/dva-cli) , checkout how to [Configure it](https://github.com/sorrycc/roadhog#配置)

Want more?

* 看看 dva 的前身 [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)，知道 dva 是怎么来的
* 在 gitc 分享 dva 的 PPT ：[React 应用框架在蚂蚁金服的实践](http://slides.com/sorrycc/dva)
* 如果还在用 dva@0.x，请尽快 [升级到 1.x](https://github.com/dvajs/dva/pull/42#issuecomment-241323617)

## License

[MIT](https://tldrlegal.com/license/mit-license)
