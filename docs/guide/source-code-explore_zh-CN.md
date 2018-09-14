# Dva 源码解析

> 作者：杨光

## 隐藏在 package.json 里的秘密

随便哪个 dva 的项目，只要敲入 npm start 就可以运行启动。之前敲了无数次我都没有在意，直到我准备研究源码的时候才意识到：**在敲下这行命令的时候，到底发生了什么呢？**

答案要去 package.json 里去寻找。

>有位技术大牛曾经告诉过我：看源码之前，先去看 package.json 。看看项目的入口文件，翻翻它用了哪些依赖，对项目便有了大致的概念。

package.json 里是这么写的：

```json
 "scripts": {
    "start": "roadhog server"
  },
```

翻翻依赖，`"roadhog": "^0.5.2"`。


既然能在 devDependencies 找到，那么肯定也能在 [npm](https://www.npmjs.com/package/roadhog) 上找到。原来是个和 webpack 相似的库，而且作者看着有点眼熟...

如果说 dva 是亲女儿，那 [roadhog](https://github.com/sorrycc/roadhog.git) 就是亲哥哥了，起的是 webpack 自动打包和热更替的作用。

在 roadhog 的默认配置里有这么一条信息：

```json
{
  "entry": "src/index.js",
}
```

后转了一圈，启动的入口回到了 `src/index.js`。

## `src/index.js`

在 `src/index.js` 里，dva 一共做了这么几件事：

0. 从 'dva' 依赖中引入 dva ：`import dva from 'dva'`; 

1. 通过函数生成一个 app 对象：`const app = dva()`; 

2. 加载插件：`app.use({})`;

3. 注入 model：`app.model(require('./models/example'))`;

4. 添加路由：`app.router(require('./routes/indexAnother'))`;

5. 启动：app.start('#root');

在这 6 步当中，dva 完成了 `使用 React 解决 view 层`、`redux 管理 model `、`saga 解决异步`的主要功能。事实上在我查阅资料以及回忆用过的脚手架时，发现目前端框架之所以被称为“框架”也就是解决了这些事情。前端工程师至今所做的事情都是在**分离动态的 data 和静态的 view **，只不过侧重点和实现方式也不同。

至今为止出了这么多框架，但是前端 MVX 的思想一直都没有改变。

# dva 

## 寻找 “dva”

既然 dva 是来自于 `dva`，那么 dva 是什么这个问题自然要去 dva 的[源码](https://github.com/dvajs/dva)中寻找了。

> 剧透：dva 是个函数，返回一了个 app 的对象。

> 剧透2：目前 dva 的源码核心部分包含两部分，`dva` 和 `dva-core`。前者用高阶组件 React-redux 实现了 view 层，后者是用 redux-saga 解决了 model 层。

老规矩，还是先翻 package.json 。

引用依赖很好的说明了 dva 的功能：统一 view 层。

```json
// dva 使用的依赖如下：

    "babel-runtime": "^6.26.0", // 一个编译后文件引用的公共库，可以有效减少编译后的文件体积
    "dva-core": "^1.1.0", // dva 另一个核心，用于处理数据层
    "global": "^4.3.2", // 用于提供全局函数的引用
    "history": "^4.6.3", // browserHistory 或者 hashHistory
    "invariant": "^2.2.2", // 一个有趣的断言库
    "isomorphic-fetch": "^2.2.1", // 方便请求异步的函数，dva 中的 fetch 来源
    "react-async-component": "^1.0.0-beta.3", // 组件懒加载
    "react-redux": "^5.0.5", // 提供了一个高阶组件，方便在各处调用 store
    "react-router-dom": "^4.1.2", // router4，终于可以像写组件一样写 router 了
    "react-router-redux": "5.0.0-alpha.6",// redux 的中间件，在 provider 里可以嵌套 router
    "redux": "^3.7.2" // 提供了 store、dispatch、reducer 
	
```
不过 script 没有给太多有用的信息，因为 `ruban build` 中的 `ruban` 显然是个私人库(虽然在 tnpm 上可以查到但是也是私人库)。但根据惯例，应该是 dva 包下的 `index.js` 文件提供了对外调用：
```js
Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = require('./lib');
exports.connect = require('react-redux').connect;
```

显然这个 `exports.default` 就是我们要找的 dva，但是源码中没有 `./lib` 文件夹。当然直接看也应该看不懂，因为一般都是使用 babel 的命令 `babel src -d libs` 进行编译后生成的，所以直接去看 `src/index.js` 文件。


## `src/index.js`

`src/index.js`[在此](https://github.com/dvajs/dva/blob/master/packages/dva/src/index.js) ：

在这里，dva 做了三件比较重要的事情：

1. 使用 call 给 dva-core 实例化的 app(这个时候还只有数据层) 的 start 方法增加了一些新功能（或者说，通过代理模式给 model 层增加了 view 层）。
2. 使用 react-redux 完成了 react 到 redux 的连接。
3. 添加了 redux 的中间件 react-redux-router，强化了 history 对象的功能。

### 使用 call 方法实现代理模式

dva 中实现代理模式的方式如下：

**1. 新建 function ，函数内实例化一个 app 对象。**
**2. 新建变量指向该对象希望代理的方法， `oldStart = app.start`。**
**3. 新建同名方法 start，在其中使用 call，指定 oldStart 的调用者为 app。**
**4. 令 app.start = start，完成对 app 对象的 start 方法的代理。**

上代码:

```js
export default function(opts = {}) {

  // ...初始化 route ，和添加 route 中间件的方法。

  /**
   * 1. 新建 function ，函数内实例化一个 app 对象。
   * 
   */
  const app = core.create(opts, createOpts);
  /**
   * 2. 新建变量指向该对象希望代理的方法
   * 
   */
  const oldAppStart = app.start;
  app.router = router;
  /**
   * 4. 令 app.start = start，完成对 app 对象的 start 方法的代理。
   * @type {[type]}
   */
  app.start = start;
  return app;

  // router 赋值

  /**
   * 3.1 新建同名方法 start，
   * 
   */
  function start(container) {
    // 合法性检测代码

    /**
     * 3.2 在其中使用 call，指定 oldStart 的调用者为 app。
     */
    oldAppStart.call(app);
	
	// 因为有 3.2 的执行才有现在的 store
    const store = app._store;

	// 使用高阶组件创建视图
  }
}
```  

> 为什么不直接在 start 方式中 oldAppStart ?
- 因为 dva-core 的 start 方法里有用到 this，不用 call 指定调用者为 app 的话，oldAppStart() 会找错对象。

> 实现代理模式一定要用到 call 吗？
- 不一定，看有没有 使用 this 或者代理的函数是不是箭头函数。从另一个角度来说，如果使用了 function 关键字又在内部使用了 this，那么一定要用 call/apply/bind 指定 this。

> 前端还有那里会用到 call ？
- 就实际开发来讲，因为已经使用了 es6 标准，基本和 this 没什么打交道的机会。使用 class 类型的组件中偶尔还会用到 this.xxx.bind(this)，stateless 组件就洗洗睡吧(因为压根没有 this)。如果实现代理，可以使用继承/反向继承的方法 —— 比如高阶组件。


### 使用 react-redux 的高阶组件传递 store

经过 call 代理后的 start 方法的主要作用，便是使用 react-redux 的 provider 组件将数据与视图联系了起来，生成 React 元素呈现给使用者。

不多说，上代码。

```js
// 使用 querySelector 获得 dom
if (isString(container)) {
  container = document.querySelector(container);
  invariant(
    container,
    `[app.start] container ${container} not found`,
  );
}

// 其他代码

// 实例化 store
oldAppStart.call(app); 
const store = app._store;

// export _getProvider for HMR
// ref: https://github.com/dvajs/dva/issues/469
app._getProvider = getProvider.bind(null, store, app);

// If has container, render; else, return react component
// 如果有真实的 dom 对象就把 react 拍进去
if (container) {
  render(container, store, app, app._router);
  // 热加载在这里
  app._plugin.apply('onHmr')(render.bind(null, container, store, app));
} else {
  // 否则就生成一个 react ，供外界调用
  return getProvider(store, this, this._router);
}
  
 // 使用高阶组件包裹组件
function getProvider(store, app, router) {
  return extraProps => (
    <Provider store={store}>
      { router({ app, history: app._history, ...extraProps }) }
    </Provider>
  );
}

// 真正的 react 在这里
function render(container, store, app, router) {
  const ReactDOM = require('react-dom');  // eslint-disable-line
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}
```

> React.createElement(getProvider(store, app, router)) 怎么理解？
- getProvider 实际上返回的不单纯是函数，而是一个无状态的 React 组件。从这个角度理解的话，ReactElement.createElement(string/ReactClass type,[object props],[children ...]) 是可以这么写的。

> 怎么理解 React 的 stateless 组件和 class 组件？
- 你猜猜？
```
JavaScript 并不存在 class 这个东西，即便是 es6 引入了以后经过 babel 编译也会转换成函数。因此直接使用无状态组件，省去了将 class 实例化再调用 render 函数的过程，有效的加快了渲染速度。

即便是 class 组件，React.createElement 最终调用的也是 render 函数。不过这个目前只是我的推论，没有代码证据的证明。
```

#### react-redux 与 provider 

> provider 是个什么东西？

本质上是个高阶组件，也是代理模式的一种实践方式。接收 redux 生成的 store 做参数后，通过上下文 context 将 store 传递进被代理组件。在保留原组件的功能不变的同时，增加了 store 的 dispatch 等方法。

> connect 是个什么东西？

connect 也是一个代理模式实现的高阶组件，为被代理的组件实现了从 context 中获得 store 的方法。

> connect()(MyComponent) 时发生了什么？

只放关键部分代码，因为我也只看懂了关键部分(捂脸跑)：

```js
import connectAdvanced from '../components/connectAdvanced' 
export function createConnect({
  connectHOC = connectAdvanced,
.... 其他初始值
} = {}) {
	
  return function connect( { // 0 号 connnect
    mapStateToProps,
    mapDispatchToProps,
   	... 其他初始值
    } = {}
  ) {
	....其他逻辑
    return connectHOC(selectorFactory, {//  1号 connect
		.... 默认参数
		selectorFactory 也是个默认参数
      })
  }
}

export default createConnect() // 这是 connect 的本体，导出时即生成 connect 0

```
```js
// hoist-non-react-statics，会自动把所有绑定在对象上的非React方法都绑定到新的对象上
import hoistStatics from 'hoist-non-react-statics'
// 1号 connect 的本体
export default function connectAdvanced() {
	// 逻辑处理

	// 1 号 connect 调用时生成 2 号 connect
  return function wrapWithConnect(WrappedComponent) {
   	// ... 逻辑处理

	// 在函数内定义了一个可以拿到上下文对象中 store 的组件
    class Connect extends Component {
      
      getChildContext() {
		// 上下文对象中获得 store
        const subscription = this.propsMode ? null : this.subscription
        return { [subscriptionKey]: subscription || this.context[subscriptionKey] }
      }
		
		// 逻辑处理

      render() {

		  	// 	最终生成了新的 react 元素，并添加了新属性
          return createElement(WrappedComponent, this.addExtraProps(selector.props))

      }
    }

	// 逻辑处理
	
	// 最后用定义的 class 和 被代理的组件生成新的 react 组件
    return hoistStatics(Connect, WrappedComponent)  // 2 号函数调用后生成的对象是组件
  }
}


```
结论：对于 connect()(MyComponent)

1. connect 调用时生成 0 号 connect
2. connect()  0 号 connect 调用，返回 1 号 connect 的调用 `connectHOC()` ，生成 2 号 connect(也是个函数) 。
3. connect()(MyComponent) 等价于 connect2(MyComponent)，返回值是一个新的组件


### redux 与 router

redux 是状态管理的库，router 是(唯一)控制页面跳转的库。两者都很美好，但是不美好的是两者无法协同工作。换句话说，当路由变化以后，store 无法感知到。

于是便有了 `react-router-redux`。

`react-router-redux` 是 redux 的一个中间件(中间件：JavaScript 代理模式的另一种实践 针对 dispatch 实现了方法的代理，在 dispatch action 的时候增加或者修改) ，主要作用是：

> 加强了React Router库中history这个实例，以允许将history中接受到的变化反应到stae中去。

[github 在此](https://github.com/reactjs/react-router-redux)

从代码上讲，主要是监听了 history 的变化：

`history.listen(location => analyticsService.track(location.pathname))`

dva 在此基础上又进行了一层代理，把代理后的对象当作初始值传递给了 dva-core，方便其在 model 的 
subscriptions 中监听 router 变化。

看看 `index.js` 里 router 的实现：

1.在 createOpts 中初始化了添加 react-router-redux 中间件的方法和其 reducer ，方便 dva-core 在创建 store 的时候直接调用。

2. 使用 patchHistory 函数代理 history.linsten，增加了一个回调函数的做参数(也就是订阅)。

> subscriptions 的东西可以放在 dva-core 里再说，

```js
import createHashHistory from 'history/createHashHistory';
import {
  routerMiddleware,
  routerReducer as routing,
} from 'react-router-redux';
import * as core from 'dva-core';

export default function (opts = {}) {
  const history = opts.history || createHashHistory();
  const createOpts = {
  	// 	初始化 react-router-redux 的 router
    initialReducer: {
      routing,
    },
	// 初始化 react-router-redux 添加中间件的方法，放在所有中间件最前面
    setupMiddlewares(middlewares) {
      return [
        routerMiddleware(history),
        ...middlewares,
      ];
    },
	// 使用代理模式为 history 对象增加新功能，并赋给 app
    setupApp(app) {
      app._history = patchHistory(history);
    },
  };

  const app = core.create(opts, createOpts);
  const oldAppStart = app.start;
  app.router = router;
  app.start = start;
  return app;

  function router(router) {
    invariant(
      isFunction(router),
      `[app.router] router should be function, but got ${typeof router}`,
    );
    app._router = router;
  }


}

// 使用代理模式扩展 history 对象的 listen 方法，添加了一个回调函数做参数并在路由变化是主动调用
function patchHistory(history) {
  const oldListen = history.listen;
  history.listen = (callback) => {
    callback(history.location);
    return oldListen.call(history, callback);
  };
  return history;
}
```

> 剧透：redux 中创建 store 的方法为：

```js
// combineReducers 接收的参数是对象
// 所以 initialReducer 的类型是对象
// 作用：将对象中所有的 reducer 组合成一个大的 reducer
const reducers = {}; 
// applyMiddleware 接收的参数是可变参数
// 所以 middleware 是数组
// 作用：将所有中间件组成一个数组，依次执行
const middleware = []; 
const store = createStore(
  combineReducers(reducers),
  initial_state, // 设置 state 的初始值
  applyMiddleware(...middleware)
);
```

## 视图与数据(上)

`src/index.js` 主要实现了 dva 的 view 层，同时传递了一些初始化数据到 dva-core 所实现的 model 层。当然，还提供了一些 dva 中常用的方法函数：

- `dynamic` 动态加载(2.0 以后官方提供 1.x 自己手动实现吧)
- `fetch` 请求方法(其实 dva 只是做了一把搬运工)
- `saga`(数据层处理异步的方法)。

这么看 dva 真的是很薄的一层封装。

而 dva-core 主要解决了 model 的问题，包括 state 管理、数据的异步加载、订阅-发布模式的实现，可以作为数据层在别处使用(看 2.0 更新也确实是作者的意图)。使用的状体啊管理库还是 redux，异步加载的解决方案是 saga。当然，一切也都写在 index.js 和 package.json 里。

## 视图与数据(下)

处理 React 的 model 层问题有很多种办法，比如状态管理就不一定要用 Redux，也可以使用 Mobx(写法会更有 MVX 框架的感觉)；异步数据流也未必使用 redux-saga，redux-thunk 或者 redux-promise 的解决方式也可以(不过目前看来 saga 是相对更优雅的)。

放两篇个人感觉比较全面的技术文档：

- 阮一峰前辈的 [redux 三部曲](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html)。
- redux-saga 的[中文文档](http://leonshi.com/redux-saga-in-chinese/docs/api/index.html)。

以及两者的 github：

- [redux](https://github.com/reactjs/redux)
- [redux-saga](https://github.com/redux-saga/redux-saga)

然后继续深扒 `dva-core`，还是先从 `package.json` 扒起。

## package.json

`dva-core` 的 `package.json` 中依赖包如下：

```json
    "babel-runtime": "^6.26.0",  // 一个编译后文件引用的公共库，可以有效减少编译后的文件体积
    "flatten": "^1.0.2", // 一个将多个数组值合并成一个数组的库
    "global": "^4.3.2",// 用于提供全局函数比如 document 的引用
    "invariant": "^2.2.1",// 一个有趣的断言库
    "is-plain-object": "^2.0.3", // 判断是否是一个对象
    "redux": "^3.7.1", // redux ，管理 react 状态的库
    "redux-saga": "^0.15.4", // 处理异步数据流
    "warning": "^3.0.0" // 同样是个断言库，不过输出的是警告
```

当然因为打包还是用的 `ruban`，script 里没有什么太多有用的东西。继续依循惯例，去翻 `src/index.js`。

## `src/index.js`

`src/index` 的源码在[这里](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/index.js)

在 `dva` 的 `src/index.js` 里，通过传递 2 个变量 `opts` 和 `createOpts` 并调用 `core.create`，`dva` 创建了一个 app 对象。其中 `opts` 是使用者添加的控制选项，`createOpts` 则是初始化了 reducer 与 redux 的中间件。

`dva-core` 的 `src/index.js` 里便是这个 app 对象的具体创建过程以及包含的方法：

```js
export function create(hooksAndOpts = {}, createOpts = {}) {
  const {
    initialReducer,
    setupApp = noop,
  } = createOpts;

  const plugin = new Plugin();
  plugin.use(filterHooks(hooksAndOpts));

  const app = {
    _models: [
      prefixNamespace({ ...dvaModel }),
    ],
    _store: null,
    _plugin: plugin,
    use: plugin.use.bind(plugin),
    model,
    start,
  };
  return app;
  	// .... 方法的实现
	
	function model(){
		// model 方法
	}
	
	functoin start(){
		// Start 方法
	}
  }
  ```

> 我最开始很不习惯 JavaScript 就是因为 JavaScript 还是一个函数向的编程语言，也就是函数里可以定义函数，返回值也可以是函数，class 最后也是被解释成函数。在 dva-core 里创建了 app 对象，但是把 model 和 start 的定义放在了后面。一开始对这种简写没看懂，后来熟悉了以后发现确实好理解。一眼就可以看到 app 所包含的方法，如果需要研究具体方法的话才需要向后看。

[Plugin](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/Plugin.js) 是作者设置的一堆**钩子**性监听函数——即是在符合某些条件的情况下下(dva 作者)进行手动调用。这样使用者只要按照作者设定过的关键词传递回调函数，在这些条件下便会自动触发。

> 有趣的是，我最初理解**钩子**的概念是在 Angular 里。为了能像 React 一样优雅的控制组件的生命周期，Angular 设置了一堆接口(因为使用的是 ts，所以 Angular 里有类和接口的区分)。只要组件实现(implements)对应的接口————或者称生命周期钩子，在对应的条件下就会运行接口的方法。 

#### Plugin 与 plugin.use

Plugin 与 plugin.use 都有使用数组的 reduce 方法的行为：
```js
const hooks = [
  'onError',
  'onStateChange',
  'onAction',
  'onHmr',
  'onReducer',
  'onEffect',
  'extraReducers',
  'extraEnhancers',
];

export function filterHooks(obj) {
  return Object.keys(obj).reduce((memo, key) => {
  // 如果对象的 key 在 hooks 数组中
  // 为 memo 对象添加新的 key，值为 obj 对应 key 的值
    if (hooks.indexOf(key) > -1) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
}

export default class Plugin {
  constructor() {
    this.hooks = hooks.reduce((memo, key) => {
      memo[key] = [];
      return memo;
    }, {});
	/*
		等同于
		
		this.hooks = {
			onError: [],
			onStateChange:[],
			....
			extraEnhancers: []
		}
	*/
  }

  use(plugin) {
    invariant(isPlainObject(plugin), 'plugin.use: plugin should be plain object');
    const hooks = this.hooks;
    for (const key in plugin) {
      if (Object.prototype.hasOwnProperty.call(plugin, key)) {
        invariant(hooks[key], `plugin.use: unknown plugin property: ${key}`);
        if (key === 'extraEnhancers') {
          hooks[key] = plugin[key];
        } else {
          hooks[key].push(plugin[key]);
        }
      }
    }
  }

  // 其他方法
}
```
- 构造器中的 `reduce` 初始化了一个以 `hooks` 数组所有元素为 key，值为空数组的对象，并赋给了 class 的私有变量 `this.hooks`。

- `filterHooks` 通过 `reduce` 过滤了 `hooks` 数组以外的钩子。

- `use` 中使用 `hasOwnProperty` 判断 `key` 是 `plugin` 的自身属性还是继承属性，使用原型链调用而不是 `plugin.hasOwnProperty()` 是防止使用者故意捣乱在 `plugin` 自己写一个 `hasOwnProperty = () => false // 这样无论如何调用 plugin.hasOwnProperty() 返回值都是 false`。

- `use` 中使用 `reduce` 为 `this.hooks` 添加了 `plugin[key]` 。 

## model 方法

`model` 是 app 添加 model 的方法，在** dva 项目**的 index.js 是这么用的。

> app.model(require('./models/example'));

在 `dva` 中没对 model 做任何处理，所以 `dva-core` 中的 model 就是 ** dva 项目**里调用的 model。

```js
  function model(m) {
    if (process.env.NODE_ENV !== 'production') {
      checkModel(m, app._models);
    }
    app._models.push(prefixNamespace(m));
  }
  
```

- `checkModel` 主要是用 `invariant` 对传入的 model 进行了合法性检查。

- `prefixNamespace` 又使用 reduce 对每一个 model 做处理，为 model 的 reducers 和 effects 中的方法添加了 `${namespace}/` 的前缀。

> Ever wonder why we dispatch the action like this in dva ? `dispatch({type: 'example/loadDashboard'` 

## start 方法

`start` 方法是 `dva-core` 的核心，在 `start` 方法里，dva 完成了** `store` 初始化** 以及 **`redux-saga` 的调用**。比起 `dva` 的 `start`，它引入了更多的调用方式。

一步一步分析：

### `onError`

```js
    const onError = (err) => {
      if (err) {
        if (typeof err === 'string') err = new Error(err);
        err.preventDefault = () => {
          err._dontReject = true;
        };
        plugin.apply('onError', (err) => {
          throw new Error(err.stack || err);
        })(err, app._store.dispatch);
      }
    };
```
这是一个全局错误处理，返回了一个接收错误并处理的函数，并以 `err` 和 `app._store.dispatch` 为参数执行调用。

看一下 `plugin.apply` 的实现：

```js
  apply(key, defaultHandler) {
    const hooks = this.hooks;
	/* 通过 validApplyHooks 进行过滤， apply 方法只能应用在全局报错或者热更替上 */ 
    const  validApplyHooks = ['onError', 'onHmr'];
    invariant(validApplyHooks.indexOf(key) > -1, `plugin.apply: hook ${key} cannot be applied`);
	/* 从钩子中拿出挂载的回调函数 ，挂载动作见 use 部分*/
    const fns = hooks[key];

    return (...args) => {
		// 如果有回调执行回调
      if (fns.length) {
        for (const fn of fns) {
          fn(...args);
        }
		// 没有回调直接抛出错误
      } else if (defaultHandler) {
        defaultHandler(...args);
		
		/*
		这里 defaultHandler 为 (err) => {
          throw new Error(err.stack || err);
        }
		*/
      }
    };
  }
  ```

###  `sagaMiddleware`

下一行代码是：    

> `const sagaMiddleware = createSagaMiddleware();`

和 `redux-sagas` 的入门教程有点差异，因为正统的教程上添加 sagas 中间件的方法是： `createSagaMiddleware(...sagas)`

> sagas 为含有 saga 方法的 generator 函数数组。

但是 api 里确实还提到，还有一~~~招从天而降的掌法~~~种动态调用的方式：

>  `const task = sagaMiddleware.run(dynamicSaga)`

于是：

```js
	  const sagaMiddleware = createSagaMiddleware();
	  // ...
      const sagas = [];
      const reducers = {...initialReducer
      };
      for (const m of app._models) {
      	reducers[m.namespace] = getReducer(m.reducers, m.state);
      	if (m.effects) sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));
      }
      // ....

      store.runSaga = sagaMiddleware.run;
      // Run sagas
      sagas.forEach(sagaMiddleware.run);
```

### `sagas`

那么 sagas 是什么呢？

```js
    const {
      middleware: promiseMiddleware,
      resolve,
      reject,
    } = createPromiseMiddleware(app);
    app._getSaga = getSaga.bind(null, resolve, reject);

    const sagas = [];
 
    for (const m of app._models) {
      if (m.effects) sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));
    }
```

显然，sagas 是一个数组，里面的元素是用 `app._getSaga` 处理后的返回结果，而 `app._getSaga` 又和上面 createPromiseMiddleware 代理 app 后返回的对象有很大关系。

#### `createPromiseMiddleware`

createPromiseMiddleware 的代码[在此](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/createPromiseMiddleware.js)。

如果看着觉得眼熟，那肯定不是因为看过 redux-promise 源码的缘故，:-p。

##### `middleware`

`middleware` 是一个 redux 的中间件，即在不影响 redux 本身功能的情况下为其添加了新特性的代码。redux 的中间件通过拦截 action 来实现其作用的。

```js
  const middleware = () => next => (action) => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
		// .... resolve ,reject
      });
    } else {
      return next(action);
    }
  };
  
    function isEffect(type) {
		// dva 里 action 的 type 有固定格式： model.namespace/model.effects
		// const [namespace] = type.split(NAMESPACE_SEP); 是 es6 解构的写法
		// 等同于 const namespace = type.split(NAMESPACE_SEP)[0];
		// NAMESPACE_SEP 的值是 `/`
    	const [namespace] = type.split(NAMESPACE_SEP);
		// 根据 namespace 过滤出对应的 model
    	const model = app._models.filter(m => m.namespace === namespace)[0];
		// 如果 model 存在并且 model.effects[type] 也存在，那必然是 effects
    	if (model) {
    		if (model.effects && model.effects[type]) {
    			return true;
    		}
    	}

    	return false;
    }
  ```

>  const middleware = ({dispatch}) => next => (action) => {... return next(action)} 基本上是一个标准的中间件写法。在 return next(action) 之前可以对 action 做各种各样的操作。因为此中间件没用到 dispatch 方法，所以省略了。

本段代码的意思是，如果 dispatch 的 action 指向的是 model 里的 effects，那么返回一个 Promise 对象。此 Promise 的对象的解决( resolve )或者驳回方法 ( reject ) 放在 map 对象中。如果是非 effects (那就是 action 了)，放行。

换句话说，middleware 拦截了指向 effects 的 action。

##### 神奇的 bind

bind 的作用是绑定新的对象，生成新函数是大家都知道概念。但是 bind 也可以提前设定好函数的某些参数生成新函数，等到最后一个参数确定时直接调用。

> JavaScript 的参数是怎么被调用的？[JavaScript 专题之函数柯里化](https://juejin.im/post/598d0b7ff265da3e1727c491)。作者：[冴羽](https://juejin.im/user/58e4b9b261ff4b006b3227f4)。文章来源：[掘金](https://juejin.im/timeline)

这段代码恰好就是 bind 的一种实践方式。

```js
  const map = {};

  const middleware = () => next => (action) => {
    const { type } = action;
    // ...
      return new Promise((resolve, reject) => {
        map[type] = {
          resolve: wrapped.bind(null, type, resolve),
          reject: wrapped.bind(null, type, reject),
        };
      });
	// ....
  };
  
  function wrapped(type, fn, args) {
    if (map[type]) delete map[type];
    fn(args);
  }

  function resolve(type, args) {
    if (map[type]) {
      map[type].resolve(args);
    }
  }

  function reject(type, args) {
    if (map[type]) {
      map[type].reject(args);
    }
  }
  
   return {
    middleware,
    resolve,
    reject,
  };
```
分析这段代码，dva 是这样做的：

1. 通过 `wrapped.bind(null, type, resolve)` 产生了一个新函数，并且赋值给匿名对象的 resolve 属性(reject 同理)。

> 1.1 wrap 接收三个参数，通过 bind 已经设定好了两个。`wrapped.bind(null, type, resolve)` 等同于 `wrap(type, resolve, xxx)`（**此处  `resolve` 是 Promise 对象中的**）。 

> 1.2 通过 bind 赋给匿名对象的 resolve 属性后，匿名对象.resolve(xxxx) 等同于 wrap(type, resolve, xxx)，即 reslove(xxx)。

2. 使用 type 在 map 对象中保存此匿名对象，而 type 是 action 的 type，即 namespace/effects 的形式，方便之后进行调用。

3. return 出的 resolve 接收 type 和 args 两个参数。type 用来在 map 中寻找 1 里的匿名函数，args 用来像 1.2 里那样执行。

> 这样做的作用是：分离了 promise 与 promise 的执行。在函数的作用域外依然可以访问到函数的内部变量，换言之：闭包。

#### `getSaga`

导出的 `resolve` 与 `reject` 方法，通过 bind 先设置进了 `getSaga` (同时也赋给了 `app._getSaga`)，sagas 最终也将 `getSaga` 的返回值放入了数组。

[getSaga 源码](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/getSaga.js)

```js
export default function getSaga(resolve, reject, effects, model, onError, onEffect) {
  return function *() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(resolve, reject, key, effects[key], model, onError, onEffect);
		// 将 watcher 分离到另一个线程去执行
        const task = yield sagaEffects.fork(watcher);
		// 同时 fork 了一个线程，用于在 model 卸载后取消正在进行中的 task
		// `${model.namespace}/@@CANCEL_EFFECTS` 的发出动作在 index.js 的 start 方法中，unmodel 方法里。
        yield sagaEffects.fork(function *() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}
```
可以看到，`getSaga` 最终返回了一个 [generator 函数](http://www.ruanyifeng.com/blog/2015/04/generator.html)。

在该函数遍历了** model 中 effects 属性**的所有方法（注：同样是 generator 函数）。结合 `index.js` 里的 ` for (const m of app._models)`，该遍历针对所有的 model。

对于每一个 effect，getSaga 生成了一个 watcher ，并使用 saga 函数的 **fork** 将该函数切分到另一个单独的线程中去（生成了一个 task 对象）。同时为了方便对该线程进行控制，在此 fork 了一个 generator 函数。在该函数中拦截了取消 effect 的 action（事实上，应该是卸载effect 所在 model 的 action），一旦监听到则立刻取消分出去的 task 线程。

##### getWatcher

```js
function getWatcher(resolve, reject, key, _effect, model, onError, onEffect) {
  let effect = _effect;
  let type = 'takeEvery';
  let ms;

  if (Array.isArray(_effect)) {
	// effect 是数组而不是函数的情况下暂不考虑
  }

  function *sagaWithCatch(...args) {
		// .... sagaWithCatch 的逻辑
  }

  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

  switch (type) {
    case 'watcher':
      return sagaWithCatch;
    case 'takeLatest':
      return function*() {
        yield takeLatest(key, sagaWithOnEffect);
      };
    case 'throttle':
      return function*() {
        yield throttle(ms, key, sagaWithOnEffect);
      };
    default:
      return function*() {
        yield takeEvery(key, sagaWithOnEffect);
      };
  }
}

function createEffects(model) {
	// createEffects(model) 的逻辑
}

function applyOnEffect(fns, effect, model, key) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
```

先不考虑 effect 的属性是数组而不是方法的情况。

`getWatcher` 接收六个参数：
- `resolve/reject`: 中间件 `middleware` 的 res 和 rej 方法。
- `key`:经过 prefixNamespace 转义后的 effect 方法名，namespace/effect（也是调用 action 时的 type）。
-` _effect`:effects 中 key 属性所指向的 generator 函数。
- `model`： model
- `onError`： 之前定义过的捕获全局错误的方法
- `onEffect`：plugin.use 中传入的在触发 effect 时执行的回调函数（钩子函数）


`applyOnEffect` 对 effect 进行了动态代理，在保证 effect （即 `_effect`）正常调用的情况下，为期添加了 fns 的回调函数数组(即 `onEffect`)。使得在 effect 执行时， `onEffect` 内的每一个回调函数都可以被触发。

因为没有经过 effects 的属性是数组的情况，所以 `type` 的值是 `takeEvery`，也就是监听每一个发出的 action ，即 `getWatcher` 的返回值最终走的是 switch 的 default 选项:

```js
function*() {
        yield takeEvery(key, sagaWithOnEffect);
      };
	  
```
换句话说，每次发出指向 effects 的函数都会调用 `sagaWithOnEffect`。

根据 `const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);` 的执行情况，如果 onEffect 的插件为空的情况下，`sagaWithOnEffect` 的值为 `sagaWithCatch`。

```js
  function *sagaWithCatch(...args) {
    try {
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` });
      const ret = yield effect(...args.concat(createEffects(model)));
      yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` });
      resolve(key, ret);
    } catch (e) {
      onError(e);
      if (!e._dontReject) {
        reject(key, e);
      }
    }
  }

```

在 `sagaWithOnEffect` 函数中，sagas 使用传入的参数(也就是 action)执行了对应的 model 中 对应的 effect 方法，同时将返回值使用之前保存在 map 里的 resolve 返回了其返回值。同时在执行 effect 方法的时候，将 saga 本身的所有方法(put、call、fork 等等)作为第二个参数，使用 `concat` 拼接在 action 的后面。在执行 effect 方法前，又发出了 start 和 end 两个 action，方便 onEffect 的插件进行拦截和调用。

因此，对于 `if (m.effects) sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));`。

1. dva 通过 `app._getSaga(m.effects, m, onError, plugin.get('onEffect'))` 返回了一个 genenrator 函数。
2. 在 genenrator 函数中手动 fork 出一个 watcher 函数的监听线程(当然也 fork 了取消线程的功能)。
3. 该函数(在普通状态下)是一个 takeEvery 的阻塞是线程，接收 2 个参数。第一个参数为监听的 action，第二个参数为监听到 action 后的回调函数。
4. (普通状态下)的回调函数，就是手动调用了 model 里 effects 中对应属性的函数。在此之前之后发出了 `start` 和 `end` 的 action，同时用之前 promise 中间件保存在 map 中的 resolve 方法返回了值。
5. 最后使用 sagas.forEach(sagaMiddleware.run) 启动了 watcher 的监听。

### store

现在已经有了针对异步数据流的解决办法，那么该创建 store 了。

正常情况的 redux 的 createStore 接收三个参数 reducer, initState,applyMiddleware(middlewares)。

不过 dva 提供了自己的 `createStore` 方法，用来组织一系列自己创建的参数。
```js
    // Create store
    const store = app._store = createStore({ // eslint-disable-line
      reducers: createReducer(),
      initialState: hooksAndOpts.initialState || {},
      plugin,
      createOpts,
      sagaMiddleware,
      promiseMiddleware,
    });
```

#### createReducer

```js
    function createReducer() {
      return reducerEnhancer(combineReducers({
        ...reducers,
        ...extraReducers,
        ...(app._store ? app._store.asyncReducers : {}),
      }));
    }
```

`createReducer` 实际上是用 plugin 里的 onReducer (如果有)扩展了 reducer 功能，对于 `const reducerEnhancer = plugin.get('onReducer');`，plugin 里的相关代码为：

```js
function getOnReducer(hook) {
  return function (reducer) {
    for (const reducerEnhancer of hook) {
      reducer = reducerEnhancer(reducer);
    }
    return reducer;
  };
}

```

> 如果有 onReducer 的插件，那么用 reducer 的插件扩展 reducer；否则直接返回 reducer。

combineReducers 中：
- 第一个 `...reducers` 是从 dva 里传入的 historyReducer，以及通过 ` reducers[m.namespace] = getReducer(m.reducers, m.state);` 剥离出的 model 中的 reducer
- 第二个参数为手动在 plugin 里添加的 extraReducers；
- 第三个参数为异步 reducer，主要是用于在 dva 运行以后动态加载 model 里的 reducer。


#### createStore


现在我们有了一个 combine 过的 reducer，有了 core 中创建的 sagaMiddleware 和 promiseMiddleware，还有了从 dva 中传入的 createOpts，现在可以正式创建 store 了。

> 从 dva 中传入的 createOpts 为 
```js
    setupMiddlewares(middlewares) {
      return [
        routerMiddleware(history),
        ...middlewares,
      ];
    },
```
> 用与把 redux-router 的中间件排在中间件的第一个。


虽然看起来很长，但是对于大多数普通用户来说，在未开启 redux 的调试插件，未传入额外的 onAction 以及 extraEnhancers 的情况下，上面的代码等价于:

```js
import { createStore, applyMiddleware, compose } from 'redux';
import flatten from 'flatten';
import invariant from 'invariant';
import window from 'global/window';
import { returnSelf, isArray } from './utils';

export default function ({
  reducers,
  initialState,
  plugin,
  sagaMiddleware,
  promiseMiddleware,
  createOpts: {
    setupMiddlewares = returnSelf,
  },
}) {

  const middlewares = setupMiddlewares([
    sagaMiddleware,
    promiseMiddleware
  ]);

  const enhancers = [
    applyMiddleware(...middlewares)
  ];

  return createStore(reducers, initialState, compose(...enhancers));
  // 对于 redux 中 的 compose 函数，在数组长度为 1  的情况下返回第一个元素。
  // compose(...enhancers) 等同于 applyMiddleware(...middlewares)
}

```

### 订阅

现在 dva 已经创建了 store，有了异步数据流加载方案，并且又做了一些其他的事情：

```js
    // Extend store
    store.runSaga = sagaMiddleware.run;
    store.asyncReducers = {};

    // Execute listeners when state is changed
    const listeners = plugin.get('onStateChange');
    for (const listener of listeners) {
      store.subscribe(() => {
        listener(store.getState());
      });
    }

    // Run sagas
    sagas.forEach(sagaMiddleware.run);
```

- 手动运行 getSaga 里返回的 watcer 函数。
- 判断如果有 onStateChange 的 plugin 也手动运行一下。

model 里的 state、effect、reducer 已经实现了，就缺最后的订阅 subscription 部分。

```js
    // Setup app
    setupApp(app);

    // Run subscriptions
    const unlisteners = {};
    for (const model of this._models) {
      if (model.subscriptions) {
        unlisteners[model.namespace] = runSubscription(model.subscriptions, model, app, onError);
      }
    }
```

setupApp(app) 是从 dva 里传过来的，主要是使用 patchHistory 函数代理 history.linsten，即强化了 redux 和 router 的联系，是的路径变化可以引起 state 的变化，进而听过监听 state 的变化来触发回调。
> 这也是 core 中唯一使用 this 的地方，逼得 dva 中必须使用 oldStart.call(app) 来进行调用。

#### runSubscription

这是 runSubscription 的代码

```js
export function run(subs, model, app, onError) {
  const funcs = [];
  const nonFuncs = [];
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      const unlistener = sub({
        dispatch: prefixedDispatch(app._store.dispatch, model),
        history: app._history,
      }, onError);
      if (isFunction(unlistener)) {
        funcs.push(unlistener);
      } else {
        nonFuncs.push(key);
      }
    }
  }
  return { funcs, nonFuncs };
}
```
- 第一个参数为 model 中的 subscription 对象。
- 第二个参数为对应的 model
- 第三个参数为 core 里创建的 app
- 第四个参数为全局异常捕获的 onError

1. `Object.prototype.hasOwnProperty.call(subs, key)` 
还是使用原型方法判断 key 是不是 subs 的自有属性。

2. 如果是自由属性，那么拿到属性对应的值(是一个 function)

3. 调用该 function，传入 dispatch 和 history 属性。history 就是经过 redux-router 强化过的 history，而 dispatch，也就是 `prefixedDispatch(app._store.dispatch, model)`

```js
export default function prefixedDispatch(dispatch, model) {
  return (action) => {
	// 断言检测
    return dispatch({ ...action, type: prefixType(type, model) });
  };
}

```

实际上是用将 action 里的 type 添加了 `${model.namespance}/` 的前缀。

自此，model 中的四大组件全部完毕，完成了 dva 的数据层处理。
