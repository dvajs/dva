English | [简体中文](./README_zh-CN.md)

# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

Lightweight front-end framework based on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga) and [react-router](https://github.com/ReactTraining/react-router). (Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## Features

* **Easy to learn, easy to use**: only 6 apis, very friendly to redux users, and **API reduce to 0 when [use with umi](https://umijs.org/guide/with-dva.html)**
* **Elm concepts**: organize models with `reducers`, `effects` and `subscriptions`
* **Support HMR**: support HMR for components, routes and models with [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr)
* **Plugin system**: e.g. we have [dva-loading](https://github.com/dvajs/dva/tree/master/packages/dva-loading) plugin to handle loading state automatically

## Demos

* [Count](https://stackblitz.com/edit/dva-example-count): Simple count example
* [User Dashboard](https://github.com/dvajs/dva/tree/master/examples/user-dashboard): User management dashboard
* [AntDesign Pro](https://github.com/ant-design/ant-design-pro)：([Demo](https://preview.pro.ant.design/))，out-of-box UI solution for enterprise applications
* [HackerNews](https://github.com/dvajs/dva-hackernews):  ([Demo](https://dvajs.github.io/dva-hackernews/))，HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin): ([Demo](http://antd-admin.zuiidea.com/))，A admin dashboard application demo built upon Ant Design and Dva.js
* [github-stars](https://github.com/sorrycc/github-stars): ([Demo](http://sorrycc.github.io/github-stars/#/?_k=rmj86f))，Github star management application
* [Account System](https://github.com/yvanwangl/AccountSystem.git): A small inventory management system
* [react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter): react-native example integrated dva and react-navigation

## Quick Start

* [Real project with dva](https://dvajs.com/guide/getting-started.html)
* [dva intro course](https://dvajs.com/guide/introduce-class.html)

More documentation, checkout [https://dvajs.com/](https://dvajs.com/)

## FAQ

### Why is it called dva?

> D.Va’s mech is nimble and powerful — its twin Fusion Cannons blast away with autofire at short range, and she can use its Boosters to barrel over enemies and obstacles, or deflect attacks with her projectile-dismantling Defense Matrix.

—— From [OverWatch](http://ow.blizzard.cn/heroes/dva)

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### Is it production ready?

Sure! We have 1000+ projects using dva in Alibaba.

### Does it support IE8?

No.

## Next

Some basic articles.

* The [8 Concepts](https://github.com/dvajs/dva/blob/master/docs/Concepts.md), and know how they are connected together
* [dva APIs](https://github.com/dvajs/dva/blob/master/docs/API.md)
* Checkout [dva knowledgemap](https://github.com/dvajs/dva-knowledgemap), including all the basic knowledge with ES6, React, dva
* Checkout [more FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)
* If your project is created by [dva-cli](https://github.com/dvajs/dva-cli), checkout how to [Configure it](https://github.com/sorrycc/roadhog#configuration)

Want more?

* 看看 dva 的前身 [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)，知道 dva 是怎么来的
* 在 gitc 分享 dva 的 PPT ：[React 应用框架在蚂蚁金服的实践](http://slides.com/sorrycc/dva)
* 如果还在用 dva@1.x，请尽快 [升级到 2.x](https://github.com/sorrycc/blog/issues/48)

## Community

### 微信群

<img src="https://gw.alipayobjects.com/zos/rmsportal/QwuMhmBXFuAqYvzktiGk.png" width="60" />

注：群满 100 人后，可加 `sorryccpro` 备注 `dva` 邀请加入。

### Telegram

[https://t.me/joinchat/G0DdHw9tDZC-_NmdKY2jYg](https://t.me/joinchat/G0DdHw9tDZC-_NmdKY2jYg)

## License

[MIT](https://tldrlegal.com/license/mit-license)
