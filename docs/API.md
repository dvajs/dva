# API

[以中文版查看此文](https://dvajs.com/api/)

## Export Files
### dva

Default export file.

### dva/router

Export the api of [react-router@4.x](https://github.com/ReactTraining/react-router), and also export [react-router-redux](https://github.com/reactjs/react-router-redux) with the `routerRedux` key.

e.g.

```js
import { Router, Route, routerRedux } from 'dva/router';
```

### dva/fetch

Async request library, export the api of [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch). It's just for convenience, you can choose other libraries for free.

### dva/saga

Export the api of [redux-saga](https://github.com/yelouafi/redux-saga).

### dva/dynamic

Util method to load React Component and dva model dynamically.

e.g.

```js
import dynamic from 'dva/dynamic';

const UserPageComponent = dynamic({
  app,
  models: () => [
    import('./models/users'),
  ],
  component: () => import('./routes/UserPage'),
});
```

`opts` include:

* app: dva instance
* models: function which return promise, and the promise return dva model
* component：function which return promise, and the promise return React Component

## dva API
### `app = dva(opts)`

Create app, and return dva instance. (Notice: dva support multiple instances.)

`opts` includes:

* `history`: Specify the history for router, default `hashHistory`
* `initialState`: Specify the initial state, default `{}`, it's priority is higher then model state

e.g. use `browserHistory`:

```js
import createHistory from 'history/createBrowserHistory';
const app = dva({
  history: createHistory(),
});
```

Besides, for convenience, we can configure [hooks](#appusehooks) in `opts`, like this:

```js
const app = dva({
  history,
  initialState,
  onError,
  onAction,
  onStateChange,
  onReducer,
  onEffect,
  onHmr,
  extraReducers,
  extraEnhancers,
});
```

### `app.use(hooks)`

Specify hooks or register plugin. (Plugin return hooks finally.)

e.g. register [dva-loading](https://github.com/dvajs/dva-loading) plugin:

```js
import createLoading from 'dva-loading';
...
app.use(createLoading(opts));
```

`hooks` includes:

#### `onError((err, dispatch) => {})`

Triggered when `effect` has error or `subscription` throw error with `done`. Used for managing global error.

Notice: `subscription`'s error must be throw with the send argument `done`. e.g.

```js
app.model({
  subscriptions: {
    setup({ dispatch }, done) {
      done(e);
    },
  },
});
```

If we are using antd, the most simple error handle would be like this:

```js
import { message } from 'antd';
const app = dva({
  onError(e) {
    message.error(e.message, /* duration */3);
  },
});
```

#### `onAction(fn | fn[])`

Triggered when action is dispatched. Used for register redux middleware.

e.g. use [redux-logger](https://github.com/evgenyrodionov/redux-logger) to log actions:

```js
import createLogger from 'redux-logger';
const app = dva({
  onAction: createLogger(opts),
});
```

#### `onStateChange(fn)`

Triggered when `state` changes. Used for sync `state` to localStorage or server and so on.

#### `onReducer(fn)`

Wrap reducer execute.

e.g. use [redux-undo](https://github.com/omnidan/redux-undo) to implement redo/undo:

```js
import undoable from 'redux-undo';
const app = dva({
  onReducer: reducer => {
    return (state, action) => {
      const undoOpts = {};
      const newState = undoable(reducer, undoOpts)(state, action);
      // 由于 dva 同步了 routing 数据，所以需要把这部分还原
      return { ...newState, routing: newState.present.routing };
    },
  },
});
```

#### `onEffect(fn)`

Wrap effect execute.

e.g. [dva-loading](https://github.com/dvajs/dva-loading) has implement auto loading state with this hook.

#### `onHmr(fn)`

HMR(Hot Module Replacement) related, currently used in [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr).

#### `extraReducers`

Specify extra reducers.

e.g. [redux-form](https://github.com/erikras/redux-form) needs extra `form` reducer:

```js
import { reducer as formReducer } from 'redux-form'
const app = dva({
  extraReducers: {
    form: formReducer,
  },
});
```

#### `extraEnhancers`

Specify extra [StoreEnhancer](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer)s.

e.g. use dva with [redux-persist](https://github.com/rt2zz/redux-persist):

```js
import { persistStore, autoRehydrate } from 'redux-persist';
const app = dva({
  extraEnhancers: [autoRehydrate()],
});
persistStore(app._store);
```

### `app.model(model)`

Register model, view [#Model](#model)  for details.

### `app.unmodel(namespace)`

Unregister model.

### `app.replaceModel(model)`

> Only available after `app.start()` got called

Replace an existing model with a new one, comparing by the namespace. If no one matches, add the new one. 

After called, old `reducers`, `effects`, `subscription` will be replaced with the new ones, while original state is kept, which means it's useful for HMR.

### `app.router(({ history, app }) => RouterConfig)`

Register router config.

e.g.

```js
import { Router, Route } from 'dva/router';
app.router(({ history }) => {
  return (
    <Router history={history}>
      <Route path="/" component={App} />
    <Router>
  );
});
```

Recommend using separate file to config router. Then we can do hmr with [babel-plugin-dva-hmr](https://github.com/dvajs/babel-plugin-dva-hmr). e.g.

```js
app.router(require('./router'));
```

Besides, if don't need router, like multiple-page application, react-native, we can pass in a function which return JSX Element. e.g.

```js
app.router(() => <App />);
```

### `app.start(selector?)`

Start application. `selector` is optionally, if no `selector`, it will return a function which return JSX element.

```js
app.start('#root');
```

e.g. implement i18n with react-intl:

```js
import { IntlProvider } from 'react-intl';
...
const App = app.start();
ReactDOM.render(<IntlProvider><App /></IntlProvider>, htmlElement);
```

## Model
model is the most important concept in dva.

e.g.

```js
app.model({
  namespace: 'todo',
	state: [],
  reducers: {
    add(state, { payload: todo }) {
      // Save data to state
      return [...state, todo];
    },
  },
  effects: {
    *save({ payload: todo }, { put, call }) {
      // Call saveTodoToServer, then trigger `add` action to save data
      yield call(saveTodoToServer, todo);
      yield put({ type: 'add', payload: todo });
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({ type: 'load' });
        }
      });
    },
  },
});
```

model includes 5 properties:

### namespace

model's namespace.

### state

models's initial state, it's priority is lower then `opts.initialState` in `dva()`.

e.g.

```
const app = dva({
  initialState: { count: 1 },
});
app.model({
  namespace: 'count',
  state: 0,
});
```

Then, state.count is 1 after `app.start()`.

### reducers

Store reducers in key/value Object. reducer is the only place to modify `state`. Triggered by `action`.

`(state, action) => newState` or `[(state, action) => newState, enhancer]`

View https://github.com/dvajs/dva/blob/master/packages/dva-core/test/reducers.test.js for details.

### effects

Store effects in key/value Object. Used for do async operations and biz logic, don't modify `state` directly. Triggered by `action`, could trigger new `action`, communicate with server, select data from global `state` and so on.

`*(action, effects) => void` or `[*(action, effects) => void, { type }]`。

type includes:

* `takeEvery`
* `takeLatest`
* `throttle`
* `watcher`

View https://github.com/dvajs/dva/blob/master/packages/dva-core/test/effects.test.js for details.

### subscriptions

Store subscriptions in key/value Object. Subscription is used for subscribing data source, then trigger action by need. It's executed when `app.start()`.

`({ dispatch, history }, done) => unlistenFunction`

Notice: if we want to unregister a model with `app.unmodel()` or `app.replaceModel()`, it's subscriptions must return unsubscribe method.
