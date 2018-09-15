---
sidebarDepth: 2
---

# Dva concept

## Data Flow

Data changes usually occur through user interaction or browser behavior (such as url redirects). When such behavior changes data, an action can be initiated via `dispatch`. If it is synchronous,  it will pass data directly to `Reducers` to update `State`. If it is asynchronous behavior (side effects), `Effects` will be triggered, then data flows to `Reducers`, and finally `State` will be updated. So in dva, the data flow is very clear. The basic principles are consistent with other open source community.

<img src="https://zos.alipayobjects.com/rmsportal/PPrerEAKbIoDZYr.png" width="807" />

## Models

### State

`type State = any`

`State` represents the state of the `Model`, that is usually represented as a javascript object (of course it can be any type). It should be treated immutable, ensuring that each time it is a new object without any reference relationships so that `State` independent. That will make easy to test and track changes.

In dva you can see the top state data via the dva instance property `_store`, but you will rarely use it:

```javascript
const app = dva();
console.log(app._store); // State data at the top
```

### Action

`type AsyncAction = any`

Action is a plain javascript object that is the only way to change State. Whether it's data from a UI event, a network callback, or a data source such as WebSocket, the action is eventually called by the dispatch function, which changes the relevant data. The action must have a `type` attribute to indicate the specific behavior. Other fields can be customized. If you want to initiate an action, you need to use the `dispatch` method. Note that `dispatch` is passed as props through the `connect` method.
```
dispatch({
  type: 'add',
});
```

### dispatch Method

`type dispatch = (a: Action) => Action`

The `dispatch` method is a method that triggers actions. Actions are the only way to change State, but an action only describes a behavior, and `dipatch` can be seen as the way to trigger this behavior, while Reducer describes how to change the data.

In dva, the components of the connected model can be accessed via props, and can be called Reducer or Effects in the Model. Common forms are:

```javascript
dispatch({
  type: 'user/add', // If you call outside the model, you need to add a namespace
  payload: {}, // Information to be passed
});
```

### Reducer

`type Reducer<S, A> = (state: S, action: A) => S`

The Reducer (also known as the reducing function) takes two arguments: the result of the previously accumulated operation and the current value to be accumulated, and a new cumulative result is returned. This function groups a collection into a single value.

The concept of Reducer comes from functional programming, and there are reduce APIs in many languages. As in javascript:

```javascript
[{x:1},{y:2},{z:3}].reduce(function(prev, next){
    return Object.assign(prev, next);
})
//return {x:1, y:2, z:3}
```

In dva, the result of the aggregate accumulation of the reducers is the state object of the current model. The new value (that is, the new state) is obtained by evaluating the value passed in the actions with the current state in the reducers. Note that the Reducer must be a [pure function](https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch3.md), so the same input always gives the same output, it should not produce any side effects. Also, every time you calculate, you should use [immutable data](https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch3.md#reasonable), which makes for a simple understanding of each operation. A new state object should always be returned (independent, pure), so hot overload and time travel can be used.

### Effect

Effect is also called a side effect, and in our application, the most common is asynchronous operations. The concept comes from functional programming, where it is called side effects because it makes our functions impure, and the same input does not necessarily get the same output.

In order to control the side-effect operation, dva introduces [redux-sagas](http://superraytin.github.io/redux-saga-in-chinese) for asynchronous process control, because of the [generator related concept](http://www.ruanyifeng.com/blog/2015/04/generator.html). So asynchronous operations are converted to synchronous, thus turning effects into pure functions. As for why we are so entangled in __pure function__, if you want to know more, you can read [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide), or its Chinese Translation [JS Functional Programming Guide](https://www.gitbook.com/book/llh911001/mostly-adequate-guide-chinese/details).

### Subscription

Subscriptions is a way to get data from __source__, which comes from elm.

Subscription semantics is an approach that is used to subscribe to a data source and then dispatch the required action based on the condition. The data source can be the current time, the server's websocket connection, keyboard input, geolocation changes, history routing changes, and more.

```javascript
import key from 'keymaster';
...
app.model({
  namespace: 'count',
  subscriptions: {
    keyEvent({dispatch}) {
      key('⌘+up, ctrl+up', () => { dispatch({type:'add'}) });
    },
  }
});
```

## Router

The "route" here refers to the front-end routing. Since our application is usually a single-page application, we need front-end code to control the routing logic, provided by the browser [History API](http://mdn.beonex.com/en/DOM/window.history.html). We can then listen to changes in the browser url to control routing related operations.

The dva instance provides the `router` method to control the route, using [react-router](https://github.com/reactjs/react-router).

```javascript
import { Router, Route } from 'dva/router';
app.router(({history}) =>
  <Router history={history}>
    <Route path="/" component={HomePage} />
  </Router>
);
```

## Route Components

In [Component Design Method](https://github.com/dvajs/dva-docs/blob/master/v1/zh-cn/tutorial/04-%E7%BB%84%E4%BB%B6%E8%AE%BE%E8%AE%A1%E6%96%B9%E6%B3%95.md), we mentioned Container Components. We usually constrain them to Route Components in dva, because in dva, Container Components are usually designed in page dimensions.

So in dva, the components that normally require the connect model are Route Components, organized in the `/routes/` directory. And the `/components/` directory holds the pure components (Presentational Components).

## Reference

- [redux docs](http://redux.js.org/docs/Glossary.html)
- [redux docs Chinese](http://cn.redux.js.org/index.html)
- [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide)
- [JS Functional Programming Guide](https://www.gitbook.com/book/llh911001/mostly-adequate-guide-chinese/details)
- [choo docs](https://github.com/yoshuawuyts/choo)
- [elm](http://elm-lang.org/blog/farewell-to-frp)
