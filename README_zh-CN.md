# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

[View README in English](README.md)

基于 [redux](https://github.com/reactjs/redux)、[redux-saga](https://github.com/redux-saga/redux-saga) 和 [react-router](https://github.com/ReactTraining/react-router) 的轻量级前端框架。(Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## 特性

* **易学易用**：仅有 6 个 api，对 redux 用户尤其友好
* **elm 概念**：通过 `reducers`, `effects` 和 `subscriptions` 组织 model
* **支持 mobile 和 react-native**：跨平台 ([react-native 例子](https://github.com/sorrycc/dva-example-react-native))
* **支持 HMR**：目前基于 [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr) 支持 components、routes 和 models 的 HMR
* **动态加载 Model 和路由**：按需加载加快访问速度 ([例子](https://github.com/dvajs/dva/blob/master/packages/dva-example-user-dashboard/src/router.js))
* **插件机制**：比如 [dva-loading](https://github.com/dvajs/dva-loading) 可以自动处理 loading 状态，不用一遍遍地写 showLoading 和 hideLoading
* **完善的语法分析库 [dva-ast](https://github.com/dvajs/dva-ast)**：[dva-cli](https://github.com/dvajs/dva-cli) 基于此实现了智能创建 model, router 等
* **支持 TypeScript**：通过 d.ts ([例子](https://github.com/sorrycc/dva-boilerplate-typescript))

## 为什么用 dva ?

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [支付宝前端应用架构的发展和选择](https://www.github.com/sorrycc/blog/issues/6)

## Demos

* [Count](https://stackblitz.com/edit/dva-example-count)，简单计数器
* [User Dashboard](https://github.com/dvajs/dva/tree/master/packages/dva-example-user-dashboard)，用户管理
* [HackerNews](https://github.com/dvajs/dva-hackernews)  ([Demo](https://dvajs.github.io/dva-hackernews/))，HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin) ([Demo](http://antd-admin.zuiidea.com/))，基于 antd 和 dva 的后台管理应用
* [github-stars](https://github.com/sorrycc/github-stars) ([Demo](http://sorrycc.github.io/github-stars/#/?_k=rmj86f))，Github Star 管理应用
* [react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter) 一个集成了 dva 和 react-navigation 典型应用场景的 React Native 实例
* [dva-example-nextjs](https://github.com/dvajs/dva/tree/master/packages/dva-example-nextjs): 和 next.js 整合使用

## 快速上手

[12 步 30 分钟，完成用户管理的 CURD 应用 (react+dva+antd)](https://github.com/sorrycc/blog/issues/18)

## FAQ

### 命名由来？

> D.Va拥有一部强大的机甲，它具有两台全自动的近距离聚变机炮、可以使机甲飞跃敌人或障碍物的推进器、 还有可以抵御来自正面的远程攻击的防御矩阵。

—— 来自 [守望先锋](http://ow.blizzard.cn/heroes/dva) 。

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### 是否可用于生产环境？

当然！公司内用于生产环境的项目估计已经有 200+ 。

### 是否支持 IE8 ？

不支持。

## 下一步

以下能帮你更好地理解和使用 dva ：

* 理解 dva 的 [8 个概念](https://github.com/dvajs/dva/blob/master/docs/Concepts_zh-CN.md) ，以及他们是如何串起来的
* 掌握 dva 的[所有 API](https://github.com/dvajs/dva/blob/master/docs/API_zh-CN.md)
* 查看 [dva 知识地图](https://github.com/dvajs/dva-knowledgemap) ，包含 ES6, React, dva 等所有基础知识
* 查看 [更多 FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)，看看别人通常会遇到什么问题
* 如果你基于 dva-cli 创建项目，最好了解他的 [配置方式](https://github.com/sorrycc/roadhog#配置)


还要了解更多?

* 看看 dva 的前身 [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)，知道 dva 是怎么来的
* 在 gitc 分享 dva 的 PPT ：[React 应用框架在蚂蚁金服的实践](http://slides.com/sorrycc/dva)
* 如果还在用 dva@1.x，请尽快 [升级到 2.x](https://github.com/sorrycc/blog/issues/48)

## License

[MIT](https://tldrlegal.com/license/mit-license)
