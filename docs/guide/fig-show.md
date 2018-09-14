# Dva Diagram

> Author: positive<br />
> Original link: [https://yuque.com/flying.ni/the-tower/tvzasn](https://yuque.com/flying.ni/the-tower/tvzasn)

## Sample background

One of the most common examples of Web classes: TodoList = Todo list + Add todo button

## Illustration 1: React notation

![图片.png | left | 747x518](https://cdn.yuque.com/yuque/0/2018/png/103904/1528436560812-2586a0b5-7a6a-4a07-895c-f822fa85d5de.png "")

According to the official React guidelines, if there is interaction between multiple components, the state (ie: data) is maintained on the smallest convention parent of these Components, which is `<App/>`

`<TodoList/> <Todo/>` and `<AddTodoBtn/>` do not maintain any state itself, and are completely passed by the parent node `<App/>` to determine its presentation. It is a pure function existence form, ie : `Pure Component`

## Illustration 2: Redux notation

React is only responsible for page rendering, not responsible for page logic. Page logic can be extracted separately from it into store

![图片.png | left | 747x558](https://cdn.yuque.com/yuque/0/2018/png/103904/1528436134375-4c15f63d-72f1-4c73-94a6-55b220d2547c.png "")

Compared with Figure 1, there are several obvious improvements:

1. The state and page logic are extracted from `<App/>` and become a separate store. The page logic is reducer.
2. `<TodoList/> ` and `<AddTodoBtn/>` are both Pure Component. It is convenient to add a wrapper to the store via the connect method to establish a connection with the store: You can inject the action into the store through the dispatch. Causes the state of the store to change, and at the same time subscribes to the state change of the store. Once the state changes, the connected component is also refreshed.
3. The process of sending a dispatch to the store using dispatch can be intercepted. Naturally, you can add various Middleware to implement various custom functions. eg: logging

In this way, each part has its own functions, lower coupling, higher reusability, and better scalability.

## Illustration 3: Join Saga

![图片.png | left | 747x504](https://cdn.yuque.com/yuque/0/2018/png/103904/1528436167824-7fa834ea-aa6c-4f9f-bab5-b8c5312bcf7e.png "")

As mentioned above, you can use Middleware to intercept the action, so that asynchronous network operations are very convenient. Make a Middleware. Here, use the redux-saga class library, and give a chestnut:

1. Click the Create Todo button to launch a type == addTodo action
2. saga intercepts the action and initiates the http request. If the request is successful, it continues to send a type == addTodoSucc action to the reducer, prompting that the creation is successful, otherwise sending the action of type == addTodoFail

## Illustration 4: Dva notation

![图片.png | left | 747x490](https://cdn.yuque.com/yuque/0/2018/png/103904/1528436195004-cd3800f2-f13d-40ba-bb1f-4efba99cfe0d.png "")

With the previous three steps, Dva's appearance has become a reality. As Dva's official website said, Dva is based on the best practice of React + Redux + Saga. It has done 3 important things, greatly improving the coding experience. :

1. Unify store and saga into a model concept, written in a js file
2. Added a Subscriptions to collect actions from other sources, eg: Keyboard operations
3. The model is very simple, similar to DSL or RoR, coding is flying fast✈️

`Convention over configuration, always good`😆

```js
app.model({
  namespace: 'count',
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    add(state) {
      const newCurrent = state.current + 1;
      return { ...state,
        record: newCurrent > state.record ? newCurrent : state.record,
        current: newCurrent,
      };
    },
    minus(state) {
      return { ...state, current: state.current - 1};
    },
  },
  effects: {
    *add(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'minus' });
    },
  },
  subscriptions: {
    keyboardWatcher({ dispatch }) {
      key('⌘+up, ctrl+up', () => { dispatch({type:'add'}) });
    },
  },
});
```
