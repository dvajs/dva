# Dva Source Resolution

> Author: Yang Guang

## Hide the secret in package.json

With any dva project, just type `npm start` and you can run it. I haven't cared about it much before, until I was ready to study the source code: **What happened when I knocked on this line of commands?**

The answer is to go to `package.json` to find it.

> A technology big shot once told me: before looking at the source code, go to `package.json`. Looking at the project's entry file, flipping through the dependencies it uses, will give you a rough overview of ​​the project.

This is written in `package.json`:

```json
 "scripts": {
    "start": "roadhog server"
  },
```

Turn over dependencies, `"roadhog": "^0.5.2"`.


Since it can be found in `devDependencies`, it can certainly be found at [npm](https://www.npmjs.com/package/roadhog). It turned out to be a library similar to webpack, and the author looked a bit familiar...

If dva is a pro-daughter, then [roadhog](https://github.com/sorrycc/roadhog.git) is a brother, and it plays the role of webpack auto-packaging and hot-swapping.

There is such a message in the default configuration of roadhog:

```json
{
  "entry": "src/index.js",
}
```

After a round turn, the boot entry returned to `src/index.js`.

## `src/index.js`

In `src/index.js`, dva has done a few things:

0. Introducing dva from the 'dva' dependency: `import dva from 'dva'`;

1. Generate an app object from the function: `const app = dva()`;

2. Load the plugin: `app.use({})`;

3. Inject model:`app.model(require('./models/example'))`;

4. Add route: `app.router(require('./routes/indexAnother'))`;

5. Start: `app.start('#root')`;

In these 6 steps, dva completed the main functions of `resolving view layer`, `redux management model`, `saga asynchronous processing`. In fact, when I looked up the data and recalled the used scaffolding, I found that the current end frame is called a "framework" precisely to solve these things. What the front-end engineers have done so far is to separate the dynamic data and the static view, but the focus and implementation are different.

So far, there have been so many frameworks, but the idea of ​​front-end MVX has not changed.

# dva 

## Looking for "dva"

Since dva is from `dva`, what dva is will naturally be found in dva's [source code](https://github.com/dvajs/dva).

> Spoiler: dva is a function that returns an app object.

> Spoiler 2: Currently the core part of dva's source code consists of two parts, `dva` and `dva-core`. The former implements the view layer with the high-level component react-redux, which solves the model layer with redux-saga.

Old rules, or first turn `package.json`.

The dependencies list is a good illustration of the power of dva: unifying the view layer.

```json
// The dependencies dva uses are as follows:

    "babel-runtime": "^6.26.0", // A public library referenced by the compiled file, which can effectively reduce the file size after compilation.
    "dva-core": "^1.1.0", // dva another core for processing the data layer
    "global": "^4.3.2", // a reference to provide a global function
    "history": "^4.6.3", // browserHistory or hashHistory
    "invariant": "^2.2.2", // An interesting assertion library
    "isomorphic-fetch": "^2.2.1", // a function that facilitates asynchronous requests, a fetch source in dva
    "react-async-component": "^1.0.0-beta.3", // component lazy loading
    "react-redux": "^5.0.5", // provides a high-level component that makes it easy to call the store everywhere
    "react-router-dom": "^4.1.2", // router4, you can finally write the router like a component.
    "react-router-redux": "5.0.0-alpha.6", // Redux middleware can be nested in the provider
    "redux": "^3.7.2" // provides store, dispatch, reducer
	
```
However, script does not give much useful information, because `ruban` in `ruban build` is obviously a private library (although it can be found on tnpm but it is also a private library). But by convention, the `index.js` file under the dva package should provide an external call:
```js
Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = require('./lib');
exports.connect = require('react-redux').connect;
```

Obviously this `exports.default` is the dva we are looking for, but there is no `./lib` folder in the source. Of course, you should not understand it directly, because it is usually compiled using babel's command `babel src -d libs`, so go directly to the `src/index.js` file.


## `src/index.js`

`src/index.js`[here](https://github.com/dvajs/dva/blob/master/packages/dva/src/index.js) :

Here, dva did three more important things:

1. Use the call to the dva-core instantiated app (this time, only the data layer) to add some new functionality to the start method (or add the view layer to the model layer via proxy mode).
2. Complete the connection from react to redux using react-redux.
3. Added redux middleware react-redux-router to enhance the function of the history object.

### Using The call Method to Implement Proxy Mode

The way to implement proxy mode in dva is as follows:

1. Create a new function that instantiates an app object inside the function.
2. The new variable points to the method that the object wants to proxy, `oldStart = app.start`.
3. Create a new method start with the same name, use `call` in it, and specify the caller of `oldStart` as app.
4. Let `app.start = start` complete the proxy for the app object's start method.

In code:

```js
export default function(opts = {}) {

  // ...initialize route , and add route middleware.

  /**
   * 1. Create a new function that instantiates an app object inside the function.
   * 
   */
  const app = core.create(opts, createOpts);
  /**
   * 2. New variable points to the method that the object wants to proxy
   * 
   */
  const oldAppStart = app.start;
  app.router = router;
  /**
   * 4. Let app.start = start complete the proxy for the app object's start method.
   * @type {[type]}
   */
  app.start = start;
  return app;

  // router assignment

  /**
   * 3.1 Create a new method with the same name start,
   * 
   */
  function start(container) {
    // legality detection code

    /**
     * 3.2 Use call in it, specifying the caller of oldStart as app.
     */
    oldAppStart.call(app);
	
// Because there is a 3.2 implementation, there is a current store
    const store = app._store;

// Create a view with high-level components
  }
}
```  

> Why not directly in the start mode `oldAppStart` ?
- Since dva-core's start method is useful for this, without `call` to specify the caller to be app, `oldAppStart()` will find the wrong object.

> Must I use `call` to implement proxy mode?
- Not necessarily, see if there is a function that uses this or the proxy is not an arrow function. On the other hand, if you use the `function` keyword and internally use `this`, be sure to specify `this` with `call/apply/bind`.

> Where will the call be used in the front end?
- As far as actual development is concerned, because the es6 standard has already been used, there is basically no chance to deal with this. `this.xxx.bin(this)` is occasionally used in components of `class` type, and the stateless component washes and sleeps (because there is no such thing). If you implement a proxy, you can use inheritance/reverse inheritance methods -- such as high-level components.


### Use The High-Level Component of react-redux to Pass The Store

The main function of the `start` method after the call proxy is to use the provider component of `react-redux` to associate the data with the view and generate a React element for presentation to the user.

Not much to say, on the code.

```js
// get dom using querySelector
if (isString(container)) {
  container = document.querySelector(container);
  invariant(
    container,
    `[app.start] container ${container} not found`,
  );
}

// other code

// instantiate store
oldAppStart.call(app); 
const store = app._store;

// export _getProvider for HMR
// ref: https://github.com/dvajs/dva/issues/469
app._getProvider = getProvider.bind(null, store, app);

// If has container, render; else, return react component
// If there is a real dom object, take the react into it.
if (container) {
  render(container, store, app, app._router);
  // hot loading here
  app._plugin.apply('onHmr')(render.bind(null, container,  store, app));
      } else {
  // Otherwise generate a react for the outside world to call
  return getProvider(store, this, this._router);
}
  
 // Wrap components with high-level components
function getProvider(store, app, router) {
  return extraProps => (
    <Provider store={store}>
      { router({ app, history: app._history, ...extraProps }) }
    </Provider>
  );
}

// The real react is here
function render(container, store, app, router) {
  const ReactDOM = require('react-dom'); // eslint-disable-line
  ReactDOM.render(React.createElement(getProvider(store, app, router)), container);
}
```

> How do you understand `React.createElement(getProvider(store, app, router))` ?
- The getProvider actually returns not just a function, but a stateless React component. From this perspective, `ReactElement.createElement(string/ReactClass type,[object props],[children ...])` can be written like this.

> How do you understand React's stateless components and class components?
- you guess?
```
JavaScript does not have a class thing, even if es6 is introduced later, it will be converted into a function after babel compilation. Therefore, the use of stateless components directly, eliminating the need to instantiate the class and then call the render function, effectively speed up the rendering.

Even for the class component, React.createElement eventually calls the `render` function. However, this is only my inference at present, and there is no proof or code evidence.
```

#### react-redux and provider

> What is the provider?

Essentially a high-level component, it is also a practical way of proxy mode. After receiving the store generated by redux as a parameter, the store is passed into the proxy component through the context context. While retaining the functionality of the original component, it adds methods such as store `dispatch`.

> What is connect?

`connect` is also a high-level component of the proxy mode implementation, which implements the method of getting the store from the context for the delegated component.

What happens when > `connect()(MyComponent)`?

Only put the key part of the code, because I only understand the key part (face running):

```js
import connectAdvanced from '../components/connectAdvanced'
export function createConnect({
  connectHOC = connectAdvanced,
//.... other initial values
} = {}) {

  return function connect( { // 0 connnect
    mapStateToProps,
    mapDispatchToProps,
   //... other initial values
    } = {}
  ) {
//....other logic
    return connectHOC(selectorFactory, {// 1 connect
//.... default parameters
//selectorFactory is also a default parameter
      })
  }
}

export default createConnect() // This is the body of connect, which generates connect 0 when exported.

```
```js
// hoist-non-react-statics, which automatically binds all non-React methods bound to the object to the new object.
import hoistStatics from 'hoist-non-react-statics'
// The body of the 1st connect
export default function connectAdvanced() {
// logical processing

// #1 connect is generated when the second connection is generated
  return function wrapWithConnect(WrappedComponent) {
   // ... logical processing

// Define a component inside the function that can get the store in the context object
    class Connect extends Component {
      
      getChildContext() {
// Get the store in the context object
        const subscription = this.propsMode ? null : this.subscription
        return { [subscriptionKey]: subscription || this.context[subscriptionKey] }
      }

// logical processing

      render() {

// Finally generated a new react element and added a new attribute
          return createElement(WrappedComponent, this.addExtraProps(selector.props))

      }
    }

// logical processing

// Finally generate a new react component with the defined class and the delegated component
    return hoistStatics(Connect, WrappedComponent) // The object generated after the call of function 2 is the component
  }
}


```
Conclusion: For `connect()(MyComponent)`

1. connect is generated when connect is connected with the number 0 connect
2. connect() No. 0 connect is called, returning the call #connectHOC()` of the 1st connect, and generating the 2nd connect (also a function).
3. `connect()(MyComponent)` is equivalent to `connect2(MyComponent)`, the return value is a new component


### redux and router

Redux is a state-managed library, and router is the (unique) library that controls page jumps. Both are wonderful, but what's not good is that the two can't work together. In other words, when the route changes, the store is not aware of it.

Then there is `react-router-redux`.

`react-router-redux` is a middleware for redux (middleware: another practice of the JavaScript proxy pattern for agents that implement methods for dispatch, added or modified during dispatch action), the main functions are:

> Enhanced the instance of history in the React Router library to allow changes in the history to be reflected in state.

[github here](https://github.com/reactjs/react-router-redux)

In terms of code, it mainly monitors the change of history:

`history.listen(location => analyticsService.track(location.pathname))`

On this basis, dva has performed a layer of proxy, passing the object after the proxy as the initial value to dva-core, which is convenient for the model.
Listen for router changes in subscriptions.

Take a look at the implementation of the router in `index.js`:

1. Initialize the method of adding react-router-redux middleware and reducer in `createOpts`, which is convenient for dva-core to call directly when creating store.

2. Use the `patchHistory` function to delegate `history.listen`, adding a parameter to the callback function (that is, subscription).

> The things in subscriptions can be placed in dva-core.

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
  // Initialize the router of react-router-redux
    initialReducer: {
      routing,
    },
// Initialize react-router-redux add middleware method, placed at the top of all middleware
    setupMiddlewares(middlewares) {
      return [
        routerMiddleware(history),
        ...middlewares,
      ];
    },
// Use the proxy mode to add new features to the history object, and assign it to the app
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

// Use the proxy mode to extend the listen method of the history object, add a callback function to do the parameters and actively call in the routing change
function patchHistory(history) {
  const oldListen = history.listen;
  history.listen = (callback) => {
    callback(history.location);
    return oldListen.call(history, callback);
  };
  return history;
}
```

> Spoiler: The method for creating a store in redux is:

```js
// combineReducers receives parameters that are objects
// So the type of initialReducer is an object
// role: combine all the reducers in the object into a large reducer
const reducers = {};
// The parameters received by applyMiddleware are variable parameters.
// So middleware is an array
/ / Role: all the middleware into an array, in turn
const middleware = [];
const store = createStore(
  combineReducers(reducers),
  initial_state, // set the initial value of state
  applyMiddleware(...middleware)
);
```

## Views and data (Above)

`src/index.js` mainly implements the view layer of dva, and passes some initialization data to the model layer implemented by dva-core. Of course, some method functions commonly used in dva are also provided:

- `dynamic` dynamic loading (2.0 after the official offer 1.x manual implementation)
- `fetch` request method (in fact, dva just did a porter)
- `saga` (data layer processing asynchronous method).

So dva is really a very thin layer of packaging.

Dva-core mainly solves the problem of model, including state management, asynchronous loading of data, and implementation of subscription-publishing mode, which can be used as a data layer elsewhere (see 2.0 update is indeed the author's intention). The management of the genre is still redux, the solution for asynchronous loading is saga. Of course, everything is written in `index.js` and `package.json`.

## Views and Data (Below)

There are many ways to deal with React's model layer. For example, state management does not have to use Redux, or you can use Mobx (writes will have a more MVX framework); asynchronous data streams may not use redux-saga, redux-thunk or The redux-promise solution is also available (although saga is currently relatively more elegant).

Put two technical documents that are more personal and personal:

- [Redux Trilogy](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html) by Yu Yifeng's predecessor.
- [Chinese documentation](http://leonshi.com/redux-saga-in-chinese/docs/api/index.html) for redux-saga.

And the github of both:

- [redux](https://github.com/reactjs/redux)
- [redux-saga](https://github.com/redux-saga/redux-saga)

Then continue to squat `dva-core`, or start with `package.json`.

## package.json

The dependencies in `package.json` of `dva-core` are as follows:

```json
    "babel-runtime": "^6.26.0", // A public library referenced by the compiled file, which can effectively reduce the file size after compilation.
    "flatten": "^1.0.2", // a library that combines multiple array values ​​into one array
    "global": "^4.3.2", // is used to provide a reference to a global function such as document
    "invariant": "^2.2.1", // An interesting assertion library
    "is-plain-object": "^2.0.3", // determine if it is an object
    "redux": "^3.7.1", // redux , the library that manages the react state
    "redux-saga": "^0.15.4", // Handling asynchronous data streams
    "warning": "^3.0.0" // is also an assertion library, but the output is a warning
```

Of course, because the package is still using `ruban`, there is not much useful stuff in the script. Continue to follow the convention and go to `src/index.js`.

## `src/index.js`

The source code for `src/index` is at [here](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/index.js)

In `drc`'s `src/index.js`, an app object is created by passing two variables `opts` and `createOpts` and calling `core.create`, `dva`. Where `opts` is the control option added by the user, and `createOpts` is the middleware that initializes reducer and redux.

The `src/index.js` of `dva-core` is the specific creation process of this app object and the methods it contains:

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
  // .... implementation of the method

function model(){
// model method
}

functoin start(){
// Start method
}
  }
  ```

> I wasn't used to JavaScript at first because JavaScript is still a function-oriented programming language, that is, functions can be defined in functions, return values ​​can also be functions, and class is finally interpreted as a function. The app object is created in dva-core, but the definitions of model and start are placed behind. I didn't understand this shorthand at first, but later I became familiar with it and found it really understandable. You can see the methods included in the app at a glance, and you need to look backwards if you need to study the specific methods.

[Plugin](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/Plugin.js) is a bunch of **hook** listener functions set by the author - that is manually invoked (dva author) if certain conditions are met. In this way, the user simply passes the callback function according to the keyword set by the author, and will automatically trigger under these conditions.

> Interestingly, I originally understood the concept of **hook** in Angular. In order to control the lifecycle of components as elegantly as React, Angular sets up a bunch of interfaces (because of the use of ts, there is a distinction between classes and interfaces in Angular). As long as the component implements the corresponding interface -- or the lifecycle hook -- the interface method is run under the corresponding conditions.

#### Plugin and plugin.use

Both `Plugin` and `plugin.use` have the behavior of using the reduce method of an array:
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
  // if the object's key is in the hooks array
  // Add a new key to the memo object, the value of obj corresponds to the value of key
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
Equivalent to

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

  // Other methods
}
```
- `reduce` in the constructor initializes an object with all elements of the `hooks` array as key and an empty array, and is assigned to the class's private variable `this.hooks`.

- `filterHooks` Filters hooks outside the `hooks` array with `reduce`.

- `use` uses `hasOwnProperty` to determine whether `key` is a `plugin` property or an inherited property. Using a prototype chain instead of `plugin.hasOwnProperty()` is to prevent the user from deliberately messing around and writing a `plugin` `hasOwnProperty = () => false // This way the call to plugin.hasOwnProperty() is false anyway.

- ````` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` `

## model Method

`model` is the method by which the app adds the model. This is used in the index.js of the **dva project**.

> app.model(require('./models/example'));

There is no processing on the model in `dva`, so the model in `dva-core` is the model called in the **dva project**.

```js
  function model(m) {
    if (process.env.NODE_ENV !== 'production') {
      checkModel(m, app._models);
    }
    app._models.push(prefixNamespace(m));
  }
  
```

- `checkModel` mainly uses `invariant` to check the legality of the incoming model.

- `prefixNamespace` uses reduce to process each model, adding a prefix of `${namespace}/` to the methods in the model's reducers and effects.

> Ever wonder why we dispatch the action like this in dva ? `dispatch({type: 'example/loadDashboard'`

## start Method

The `start` method is the core of `dva-core`. In the `start` method, dva completes the **`store` initialization** and the **`redux-saga` call**. It introduces more calls than `dva`'s `start`.

Step by step analysis:

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
This is a global error handler that returns a function that receives the error and handles it, and executes the call with the arguments `err` and `app._store.dispatch`.

Take a look at the implementation of `plugin.apply`:

```js
  apply(key, defaultHandler) {
    const hooks = this.hooks;
/* Filtered by validApplyHooks, apply method can only be applied to global error or hot swap */
    const validApplyHooks = ['onError', 'onHmr'];
    invariant(validApplyHooks.indexOf(key) > -1, `plugin.apply: hook ${key} cannot be applied`);
/* Take the mounted callback function from the hook. See the use section* for the mount action.
    Const fns = hooks[key];

    Return (...args) => {
// If there is a callback execution callback
      If (fns.length) {
        For (const fn of fns) {
          Fn(...args);
        }
// throws an error without a callback
      } else if (defaultHandler) {
        defaultHandler(...args);

/*
Here the defaultHandler is (err) => {
          Throw new Error(err.stack || err);
        }
*/
      }
    };
  }
  ```

### `sagaMiddleware`

The next line of code is:

> `const sagaMiddleware = createSagaMiddleware();`

It's a bit different from the introductory tutorial for `redux-sagas`, because the way to add sagas middleware on the orthodox tutorial is: `createSagaMiddleware(...sagas)`

> sagas is an array of generator functions with saga methods.

However, the api does mention that there is still a ~~~ trick to the sky from the sky ~~~ kind of dynamic call:

> `const task = sagaMiddleware.run(dynamicSaga)`

then:

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

So what is sagas?

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

Obviously, sagas is an array, the elements inside are returned by `app._getSaga`, and `app._getSaga` has a lot to do with the object returned by the `createPromiseMiddleware` proxy app above.

#### `createPromiseMiddleware`

The code for `createPromiseMiddleware` [here](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/createPromiseMiddleware.js).

If it looks familiar, it is certainly not because of the redux-promise source code, :-p.

##### `middleware`

`middleware` is a redux middleware that adds new features to the redux itself without affecting its functionality. Redux's middleware does its job by intercepting actions.

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
// The type of action in dva has a fixed format: model.namespace/model.effects
// const [namespace] = type.split(NAMESPACE_SEP); yes es6 deconstruction
// is equivalent to const namespace = type.split(NAMESPACE_SEP)[0];
// The value of NAMESPACE_SEP is `/`
    const [namespace] = type.split(NAMESPACE_SEP);
// According to the namespace filter out the corresponding model
    const model = app._models.filter(m => m.namespace === namespace)[0];
// If the model exists and model.effects[type] also exists, it must be effects
    if (model) {
    if (model.effects && model.effects[type]) {
    return true;
    }
    }

    return false;
    }
  ```

> const middleware = ({dispatch}) => next => (action) => {... return next(action)} is basically a standard middleware. You can do a variety of actions on the action before return next(action) . Because this middleware does not use the dispatch method, it is omitted.

The meaning of this code is that if the dispatch action points to the effects in the model, then a Promise object is returned. The `resolve` or `reject` method for this `Promise` object is placed in the `map` object. If it is non-effects (that is action), release it.

In other words, middleware intercepts actions that point to effects.

##### Magic bind

The role of `bind` is to bind new objects, and to generate new functions is everyone knows the concept. But `bind` can also set some parameters of the function in advance to generate a new function, and wait until the last parameter is determined.

> How are JavaScript parameters called? [JavaScript special function Curry](https://juejin.im/post/598d0b7ff265da3e1727c491). Author: [Hu Yu](https://juejin.im/user/58e4b9b261ff4b006b3227f4). Article source: [Nuggets](https://juejin.im/timeline)

This code happens to be a way of doing things with bind.

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
Analyze this code, dva does this:

1. Generate a new function via `wrapped.bind(null, type, resolve)` and assign it to the resolve property of the anonymous object (reject).

> 1.1 wrap Receives three parameters, which have been set by bind. `wrapped.bind(null, type, resolve)` is equivalent to `wrap(type, resolve, xxx)` (**where `resolve` is the** in the Promise object).

> 1.2 After bind is assigned to the resolve attribute of an anonymous object, the anonymous object .resolve(xxxx) is equivalent to wrap(type, resolve, xxx), ie reslove(xxx).

2. Use type to save this anonymous object in the `map` object, and type is the type of action, which is the form of namespace/effects, which is convenient to call later.

3. The return of the `resolve` receives two arguments of type and `args`. Type is used to find 1 anonymous function in `map`, `args` is used to execute as in 1.2.

> The effect of this is to separate the execution of promises and promises. The internal variables of the function can still be accessed outside the scope of the function, in other words: closures.

#### `getSaga`

The exported `resolve` and `reject` methods are first set into `getSaga` (also assigned to `app._getSaga`) via bind, and sagas finally puts the return value of `getSaga` into the array.

[getSaga source](https://github.com/dvajs/dva/blob/master/packages/dva-core/src/getSaga.js)

```js
export default function getSaga(resolve, reject, effects, model, onError, onEffect) {
  return function *() {
    for (const key in effects) {
      if (Object.prototype.hasOwnProperty.call(effects, key)) {
        const watcher = getWatcher(resolve, reject, key, effects[key], model, onError, onEffect);
// Separate the watcher to another thread to execute
        const task = yield sagaEffects.fork(watcher);
// Also fork a thread to cancel the in progress task after the model is unloaded
// The issue of `${model.namespace}/@@CANCEL_EFFECTS` is in the start method of index.js , in the unmodel method.
        yield sagaEffects.fork(function *() {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  };
}
```
As you can see, `getSaga` eventually returns a [generator function](http://www.ruanyifeng.com/blog/2015/04/generator.html).

This function traverses all the methods of the effects property **in the** model (note: the same is the generator function). Combine ` for (const m of app._models)` in `index.js`, which is for all models.

For each effect, getSaga generates a watcher and uses the **fork** of the saga function to split the function into a separate thread (generating a task object). At the same time, in order to facilitate the control of this thread, there is a generator function here. In this function, the action that cancels the effect is intercepted (in fact, it should be the action of the model in which the effect is unloaded), and once it is intercepted, the task thread that was split is immediately cancelled.

##### getWatcher

```js
function getWatcher(resolve, reject, key, _effect, model, onError, onEffect) {
  let effect = _effect;
  let type = 'takeEvery';
  let ms;

  if (Array.isArray(_effect)) {
	// effect is not considered in the case of an array instead of a function
  }

  function *sagaWithCatch(...args) {
		// .... logic of sagaWithCatch
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
	// the logic of createEffects(model)
}

function applyOnEffect(fns, effect, model, key) {
  for (const fn of fns) {
    effect = fn(effect, sagaEffects, model, key);
  }
  return effect;
}
```

Let's not consider the case where the attribute of effect is an array rather than a method.

`getWatcher` receives six parameters:
- `resolve/reject`: The res and rej methods of the middleware `middleware`.
- `key`: The name of the effect method after the escape of prefixNamespace, namespace/effect (also the type when the action is called).
-` _effect`: The generator function pointed to by the key attribute in effects.
- `model`: model
- `onError`: previously defined method for capturing global errors
- Callback function (hook function) that is executed when the effect is triggered in `onEffect`:plugin.use


`applyOnEffect` dynamically delegates the effect, and in the case of ensuring that the effect (ie `_effect`) is called normally, an array of callback functions of fns (ie `onEffect`) is added. This allows each callback function inside `onEffect` to be fired when effect is executed.

Because the property without effects is an array, the value of `type` is `takeEvery`, which means that each action is listened to, ie the return value of `getWatcher` is finally the default option of switch:

```js
function*() {
        yield takeEvery(key, sagaWithOnEffect);
      };

```
In other words, `sagaWithOnEffect` is called every time a function that points to effects is issued.

According to the execution of `const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);`, if the onEffect plugin is empty, the value of `sagaWithOnEffect` is `sagaWithCatch`.

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

In the `sagaWithOnEffect` function, sagas uses the passed argument (that is, action) to execute the corresponding effect method in the corresponding model, and returns the return value using the `resolve` stored in the map before returning its return value. At the same time, when executing the `effect` method, all the methods of saga itself (put, call, fork, etc.) are used as the second parameter, and the `concat` is used to splicing behind the action. Before the `effect` method is executed, two actions, `start` and `end`, are issued to facilitate the interception and invocation of the `onEffect` plugin.

So for `if (m.effects) sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect')));`.

1. dva returns a genenrator function via `app._getSaga(m.effects, m, onError, plugin.get('onEffect'))`.
2. Manually fork out the listener thread of a watcher function in the genenrator function (of course, fork cancels the function of the thread).
3. The function (in the normal state) is a takeEvery block that is a thread that receives 2 arguments. The first parameter is the action of the listener, and the second parameter is the callback function after the action is listened to.
4. The callback function (in the normal state) is a function that manually calls the corresponding attribute in the effects in the model. The actions of `start` and `end` were issued after this, and the resolve method saved in the map with the previous promise middleware returned the value.
5. Finally, watcher's listener is started using `sagas.forEach(sagaMiddleware.run)`.

### store

Now that you have a solution for asynchronous data streams, it's time to create a store.

The normal redux `createStore` receives three parameters `reducer`, `initState`, `applyMiddleware(middlewares`).

However, dva provides its own `createStore` method to organize a series of parameters that you create yourself.
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

`createReducer` actually extends the reducer function with onReducer (if any) in plugin. For `const reducerEnhancer = plugin.get('onReducer');`, the relevant code in plugin is:

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

> If there is a plugin for onReducer, expand reducer with the reducer's plugin; otherwise return directly to reducer.

In `combineReducers`:
- The first `...reducers` is the `historyReducer` passed in from dva and the reducer in the model stripped out by `reducers[m.namespace] = getReducer(m.reducers, m.state);`
- The second parameter is the `extraReducers` added manually in the plugin;
- The third parameter is the asynchronous reducer, which is mainly used to dynamically load the reducer in the model after dva runs.


#### createStore


Now that we have a combine reducer, with sagaMiddleware and `promiseMiddleware` created in core, and createOpts passed in from dva, we can now officially create the store.

> The createOpts passed in from dva is
```js
    setupMiddlewares(middlewares) {
      return [
        routerMiddleware(history),
        ...middlewares,
      ];
    },
```
> Use the middleware that puts redux-router in the middle of the middleware.


Although it looks long, for most normal users, the above code is equivalent to: if the debug plugin for redux is not enabled, and no additional onAction and extraEnhancers are passed.

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
  // For the compose function in redux, returns the first element if the array length is 1.
   // compose(...enhancers) is equivalent to applyMiddleware(...middlewares)
}

```

### Subscribe

Now dva has created the store, has an asynchronous data stream loading scheme, and does something else:

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

- Manually run the watcer function returned in getSaga.
- Determine if the plugin with onStateChange is also run manually.

The state, effect, and reducer in the model have been implemented, and the last subscription subscription is missing.

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

`setupApp(app)` is passed from dva. It mainly uses the patchHistory function to proxy `history.listen`, which strengthens the connection between redux and router. The path change can cause the state to change, and then listen to the change of the listen state to trigger Callback.
> This is also the only place in the core that uses this , which forces the dva to be called with oldStart.call(app) .

#### runSubscription

This is the code for `runSubscription`

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
- The first parameter is the subscription object in the model.
- The second parameter is the corresponding model
- The third parameter is the app created in core
- The fourth parameter is the onError captured by the global exception.

1. `Object.prototype.hasOwnProperty.call(subs, key)`
Still use the prototype method to determine whether key is a self-owned property of subs.

2. If it is a free attribute, then get the value corresponding to the attribute (is a function)

3. Call the function, passing in the dispatch and history properties. History is the history that has been enhanced by redux-router, and dispatch, which is `prefixedDispatch(app._store.dispatch, model)`

```js
export default function prefixedDispatch(dispatch, model) {
  return (action) => {
    // assertion detection
    return dispatch({ ...action, type: prefixType(type, model) });
   };
}

```

In fact, the prefix of `${model.namespance}/` is added to the type in the action.

Since then, all four components in the model have been completed, and the data layer processing of dva has been completed.
