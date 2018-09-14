# 介绍

dva 首先是一个基于 [redux](https://github.com/reduxjs/redux) 和 [redux-saga](https://github.com/redux-saga/redux-saga) 的数据流方案，然后为了简化开发体验，dva 还额外内置了 [react-router](https://github.com/ReactTraining/react-router) 和 [fetch](https://github.com/github/fetch)，所以也可以理解为一个轻量级的应用框架。

## 特性

* **易学易用**，仅有 6 个 api，对 redux 用户尤其友好，[配合 umi 使用](https://umijs.org/guide/with-dva.html)后更是降低为 0 API
* **elm 概念**，通过 reducers, effects 和 subscriptions 组织 model
* **插件机制**，比如 [dva-loading](https://github.com/dvajs/dva/tree/master/packages/dva-loading) 可以自动处理 loading 状态，不用一遍遍地写 showLoading 和 hideLoading
* **支持 HMR**，基于 [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr) 实现 components、routes 和 models 的 HMR

## 他是如何工作的？

## 他是怎么来的？

* [Why dva and what's dva](https://github.com/dvajs/dva/issues/1)
* [支付宝前端应用架构的发展和选择](https://www.github.com/sorrycc/blog/issues/6)

## 谁在用？

## 为什么不是...?

### redux
### mobx

## 命名由来？

> D.Va拥有一部强大的机甲，它具有两台全自动的近距离聚变机炮、可以使机甲飞跃敌人或障碍物的推进器、 还有可以抵御来自正面的远程攻击的防御矩阵。

—— 来自 [守望先锋](https://ow.blizzard.cn/heroes/overwatch-dva) 。

<img src="https://zos.alipayobjects.com/rmsportal/psagSCVHOKQVqqNjjMdf.jpg" width="200" height="200" />
