[English](./README.md) | 简体中文

# dva

[![NPM version](https://img.shields.io/npm/v/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Build Status](https://img.shields.io/travis/dvajs/dva.svg?style=flat)](https://travis-ci.org/dvajs/dva)
[![Coverage Status](https://img.shields.io/coveralls/dvajs/dva.svg?style=flat)](https://coveralls.io/r/dvajs/dva)
[![NPM downloads](http://img.shields.io/npm/dm/dva.svg?style=flat)](https://npmjs.org/package/dva)
[![Dependencies](https://david-dm.org/dvajs/dva/status.svg)](https://david-dm.org/dvajs/dva)
[![Join the chat at https://gitter.im/dvajs/Lobby](https://img.shields.io/gitter/room/dvajs/Lobby.svg?style=flat)](https://gitter.im/dvajs/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

基于 [redux](https://github.com/reactjs/redux)、[redux-saga](https://github.com/redux-saga/redux-saga) 和 [react-router](https://github.com/ReactTraining/react-router) 的轻量级前端框架。(Inspired by [elm](http://elm-lang.org/) and [choo](https://github.com/yoshuawuyts/choo))

---

## 特性

* **易学易用**，仅有 6 个 api，对 redux 用户尤其友好，**[配合 umi 使用](https://umijs.org/guide/with-dva.html)后更是降低为 0 API**
* **elm 概念**，通过 reducers, effects 和 subscriptions 组织 model
* **插件机制**，比如 [dva-loading](https://github.com/dvajs/dva/tree/master/packages/dva-loading) 可以自动处理 loading 状态，不用一遍遍地写 showLoading 和 hideLoading
* **支持 HMR**，基于 [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr) 实现 components、routes 和 models 的 HMR

## 快速上手

* [dva 和 antd 项目快速上手](https://dvajs.com/guide/getting-started.html)
* [dva 入门课](https://dvajs.com/guide/introduce-class.html)

更多文档，详见：[https://dvajs.com/](https://dvajs.com/)

## 他是怎么来的？

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [支付宝前端应用架构的发展和选择](https://www.github.com/sorrycc/blog/issues/6)

## 例子

* [Count](https://stackblitz.com/edit/dva-example-count): 简单计数器
* [User Dashboard](https://github.com/dvajs/dva/tree/master/examples/user-dashboard): 用户管理
* [AntDesign Pro](https://github.com/ant-design/ant-design-pro)：([Demo](https://preview.pro.ant.design/))，开箱即用的中台前端/设计解决方案
* [HackerNews](https://github.com/dvajs/dva-hackernews):  ([Demo](https://dvajs.github.io/dva-hackernews/))，HackerNews Clone
* [antd-admin](https://github.com/zuiidea/antd-admin): ([Demo](http://antd-admin.zuiidea.com/))，基于 antd 和 dva 的后台管理应用
* [github-stars](https://github.com/sorrycc/github-stars): ([Demo](http://sorrycc.github.io/github-stars/#/?_k=rmj86f))，Github Star 管理应用
* [Account System](https://github.com/yvanwangl/AccountSystem.git): 小型库存管理系统
* [react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter): 集成了 dva 和 react-navigation 典型应用场景的 React Native 实例

## FAQ

### 命名由来？

> D.Va拥有一部强大的机甲，它具有两台全自动的近距离聚变机炮、可以使机甲飞跃敌人或障碍物的推进器、 还有可以抵御来自正面的远程攻击的防御矩阵。

—— 来自 [守望先锋](http://ow.blizzard.cn/heroes/overwatch-dva) 。

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />

### 是否可用于生产环境？

当然！公司内用于生产环境的项目估计已经有 1000+ 。

### 是否支持 IE8 ？

不支持。

## 下一步

以下能帮你更好地理解和使用 dva ：

* 理解 dva 的 [8 个概念](https://dvajs.com/guide/concepts.html) ，以及他们是如何串起来的
* 掌握 dva 的[所有 API](https://dvajs.com/api/)
* 查看 [dva 知识地图](https://dvajs.com/knowledgemap/) ，包含 ES6, React, dva 等所有基础知识
* 查看 [更多 FAQ](https://github.com/dvajs/dva/issues?q=is%3Aissue+is%3Aclosed+label%3Afaq)，看看别人通常会遇到什么问题
* 如果你基于 dva-cli 创建项目，最好了解他的 [配置方式](https://github.com/sorrycc/roadhog/blob/master/README_zh-cn.md#配置)

还要了解更多?

* 看看 dva 的前身 [React + Redux 最佳实践](https://github.com/sorrycc/blog/issues/1)，知道 dva 是怎么来的
* 在 gitc 分享 dva 的 PPT ：[React 应用框架在蚂蚁金服的实践](http://slides.com/sorrycc/dva)
* 如果还在用 dva@1.x，请尽快 [升级到 2.x](https://github.com/sorrycc/blog/issues/48)

## 社区

### 微信群

<img src="https://gw.alipayobjects.com/zos/rmsportal/QwuMhmBXFuAqYvzktiGk.png" width="60" />

注：群满 100 人后，可加 `sorryccpro` 备注 `dva` 邀请加入。

### Telegram

[https://t.me/joinchat/G0DdHw9tDZC-_NmdKY2jYg](https://t.me/joinchat/G0DdHw9tDZC-_NmdKY2jYg)

## License

[MIT](https://tldrlegal.com/license/mit-license)
