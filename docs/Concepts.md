# Concepts

[以中文版查看此文](https://dvajs.com/guide/concepts.html)

## Data Flow

<img src="https://zos.alipayobjects.com/rmsportal/PPrerEAKbIoDZYr.png" width="807" />

## Models

### State

`type State = any`

The state tree of your models. Usually, the state is a JavaScript object (although technically it can be any type) which is immutable data.

In dva, you can access top state tree data by `_store`.

```javascript
const app = dva();
console.log(app._store); // top state
```

### Action

`type AsyncAction = any`

Just like Redux's Action, in dva, action is a plain object that represents an intention to change the state. Actions are the only way to get data into the store. Any data, whether from UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions.action. (PS: dispatch is realized through props by connecting components.)

```javascript
dispatch({
  type: 'add',
});
```

### dispatch function

`type dispatch = (a: Action) => Action`

A dispatching function (or simply dispatch function) is a function that accepts an action or an async action; it then may or may not dispatch one or more actions to the store.

Dispatching function is a function for triggering action, action is the only way to change state, but it just describes an action. while dispatch can be regarded as a way to trigger this action, and Reducer is to describe how to change state.

```javascript
dispatch({
  type: 'user/add', // if in model outside, need to add namespace
  payload: {},
});
```

### Reducer

`type Reducer<S, A> = (state: S, action: A) => S`

Just like Redux's Reducer, a reducer (also called a reducing function) is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value.

Reducer's concepts from FP:

```javascript
[{x:1},{y:2},{z:3}].reduce(function(prev, next){
    return Object.assign(prev, next);
})
//return {x:1, y:2, z:3}
```

In dva, reducers accumulate current model's state. There are some things need to be notice that reducer must be [pure function](https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch3.md) and every calculated data must be [immutable data](https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch3.md#reasonable).

### Effect

In dva, we use [redux-sagas](https://redux-saga.js.org/) to control asynchronous flow.
You can learn more in [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide).

In our applications, the most well-known side effect is asynchronous operation, it comes from the conception of functional programing, it is called side effect because it makes our function impure, and the same input may not result in the same output.

### Subscription

Subscriptions is a way to get data from source, it is come from elm.

Data source can be: the current time, the websocket connection of server, keyboard input, geolocation change, history router change, etc..

```javascript
import key from 'keymaster';
...
app.model({
  namespace: 'count',
  subscriptions: {
    keyEvent(dispatch) {
      key('⌘+up, ctrl+up', () => { dispatch({type:'add'}) });
    },
  }
});
```

## Router

Hereby router usually means frontend router. Because our current app is single page app, frontend codes are required to control the router logics. Through History API provided by the browser, we can monitor the change of the browser's url, so as to control the router.

dva provide `router` function to control router, based on [react-router](https://github.com/reactjs/react-router)。

```javascript
import { Router, Route } from 'dva/router';
app.router(({history}) =>
  <Router history={history}>
    <Route path="/" component={HomePage} />
  </Router>
);
```

## Route Components

In dva, we restrict container components to route components, because we use page dimension to design container components.

therefore, almost all connected model components are route components, route components in `/routes/` directory, presentational Components in `/components/` directory.

## References
- [redux docs](http://redux.js.org/docs/Glossary.html)
- [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide)
- [choo docs](https://github.com/yoshuawuyts/choo)
- [elm](http://elm-lang.org/blog/farewell-to-frp)
