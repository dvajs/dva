# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

[以中文查看](./README_zh-CN.md)

Lightweight front-end framework based on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga) and [react-router](https://github.com/ReactTraining/react-router). (Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## Features

* **Easy to learn, easy to use**: only 6 apis, very friendly to redux users
* **Elm concepts**: organize models with `reducers`, `effects` and `subscriptions`
* **Support mobile and react-native**: cross platform ([ReactNative Example](https://github.com/sorrycc/dva-example-react-native))
* **Support HMR**: support HMR for components, routes and models with [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr)
* **Support load model and routes dynamically**: Improve performance ([Example](https://github.com/dvajs/dva/blob/master/packages/dva-example-user-dashboard/src/router.js))
* **Plugin system**: e.g. we have [dva-loading](https://github.com/dvajs/dva-loading) plugin to handle loading state automatically
* **Support TypeScript**：with d.ts ([Example](https://github.com/sorrycc/dva-boilerplate-typescript))

## Why dva ?

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [支付宝前端应用架构的发展和选择](https://www.github.com/sorrycc/blog/issues/6)

## Demos

* [Count](https://stackblitz.com/edit/dva-example-count) Simple count example
* [User Dashboard](https://github.com/dvajs/dva/tree/master/packages/dva-example-user-dashboard): User management dashboard
* [HackerNews](https://github.com/dvajs/dva-hackernews)  ([Demo](https://dvajs.github.io/dva-hackernews/)): HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin) ([Demo](http://antd-admin.zuiidea.com/)): Admin dashboard based on antd and dva
* [github-stars](https://github.com/sorrycc/github-stars) ([Demo](http://sorrycc.github.io/github-stars/#/?_k=rmj86f))，Github Star management tool
* [react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter) a React Native starter powered by dva and react-navigation
* [dva-example-nextjs](https://github.com/dvajs/dva/tree/master/packages/dva-example-nextjs): How to integrate with next.js

## Quick Start

- [Getting Started](https://github.com/dvajs/dva/blob/master/docs/GettingStarted.md)
- [12 步 30 分钟，完成用户管理的 CURD 应用 (react+dva+antd)](https://github.com/sorrycc/blog/issues/18)

## FAQ

### Why is it called dva?

> D.Va’s mech is nimble and powerful — its twin Fusion Cannons blast away with autofire at short range, and she can use its Boosters to barrel over enemies and obstacles, or deflect attacks with her projectile-dismantling Defense Matrix.

—— From [OverWatch](http://ow.blizzard.cn/heroes/dva)

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### Is it production ready?

Sure! We have 200+ projects using dva in Alibaba.

### Does it support IE8?

No.

## Next

Some basic articles.

* The [8 Concepts](https://github.com/dvajs/dva/blob/master/docs/Concepts.md), and know how they are connected together
* [dva APIs](https://github.com/dvajs/dva/blob/master/docs/API.md)
* Checkout [dva knowledgemap](https://github.com/dvajs/dva-knowledgemap), including all the basic knowledge with ES6, React, dva
* Checkout [more FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)
* If your project is created by [dva-cli](https://github.com/dvajs/dva-cli), checkout how to [Configure it](https://github.com/sorrycc/roadhog/blob/master/README_en-us.md#configuration)

Want more?

* 看看 dva 的前身 [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)，知道 dva 是怎么来的
* 在 gitc 分享 dva 的 PPT ：[React 应用框架在蚂蚁金服的实践](http://slides.com/sorrycc/dva)
* 如果还在用 dva@1.x，请尽快 [升级到 2.x](https://github.com/sorrycc/blog/issues/48)

## License

[MIT](https://tldrlegal.com/license/mit-license)
