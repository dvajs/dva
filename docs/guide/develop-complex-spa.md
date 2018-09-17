# Using Dva to Develop Complex SPAs

> Author: Xu Fei

In dva's official repository, a tutorial is provided to cover some of the basic concepts of dva. In the real business development process, there are many scenarios that cannot be covered by those basic operations. This article attempts to enumerate some common use cases for dva implementations.

## Dynamically Loading Model

In many business scenarios, we may define a lot of models, but we don't need to load them all when the application starts. It is more typical of various management consoles. If each function page is switched through a route and has no relationship with each other, webpack's require.ensure is usually used to do the lazy loading of the code module.

We can also use this feature to do dynamic loading of the model.

```JavaScript
function RouterConfig({ history, app }) {
  const routes = [
    {
      path: '/',
      name: 'IndexPage',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          registerModel(app, require('./models/dashboard'));
          cb(null, require('./routes/IndexPage'));
        });
      },
    },
    {
      path: '/users',
      name: 'UsersPage',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          registerModel(app, require('./models/users'));
          cb(null, require('./routes/Users'));
        });
      },
    },
  ];

  return <Router history={history} routes={routes} />;
}
```

Thus, when the view switches to this route, the corresponding model will be loaded. Similarly, you can also do dynamic removal of the model, but in general, you do not need to remove it.

## Using Model to Share Global Information

In the previous section we mentioned that the model can be loaded dynamically or removed. From this perspective, models can have different lifecycles, some can be accompanied by functional views, and some can run through the lifecycle of the entire application.

From the business scenario, there are quite a few cases where global models can be used. For example, models can be used to share data between routes as we move forward and backward between routes. A typical use case is list pages and detail pages. Thus, you can use the same model to represent their data.

Note that if more than one model is loaded in the current application, a select operation in one of the effects can get the state in the other:

```JavaScript
*foo(action, { select }) {
  const { a, b } = yield select();
}
```

Here, a, b can be states of two different models, respectively. Therefore, with this feature, we don't have to organize the model according to the structure of the view. We can appropriately store some data in the model corresponding to the business according to the business classification, and update it through different effects, and then go to the place where it is obtained. Therefore, this can make the model more reusable.

## Model Reuse

Sometimes, the business may encounter the desire to remove some models with less external associations. We may take out such a model and connect it with a different view container.

```JavaScript
export default {
  namespace: 'reusable',
  state: {},
  reducers: {},
  effects: {}
}
```

Therefore, in business, the possible use cases are:

```
              ContainerA <-- ModelA
                   |
    ------------------------------
    |                            |
ContainerB <-- reusable     ContainerC <-- reusable
```

Here, ContainerB and ContainerC are subordinates of ContainerA, and their logical structure is the same, but the appearance is different. We can let them connect to the same model separately. Note that at this time, the modification of the model will affect both views at the same time, because the model is directly stored in the state as the key in the state, there is actually only one instance.

## Dynamically Expanding the Model

In the previous section, we mentioned that models can be shared in several views, but business requirements are more variable, and we are likely to encounter this situation again:

`Several business views look the same, and there are a few differences in the model.

In this case, if we let them reuse the same model, but doing so is a challenge for maintenance. It is possible to change one of them and affect others. Therefore, in this case, it may be better to extend the model.

The so-called extension is usually to do a few things:

- Add something
- Overwrite some existing things
- Create something dynamically based on conditions

Notice that each model in dva is actually a plain JavaScript object, with

- namespace
- state
- reducers
- effects
- subscriptions

From this perspective, it is easier to add or override something. For example, using `Object.assign` to copy object properties, you can add or overwrite new content to the original object.

Note that there are two levels. The `state`, `reducers`, `effects`, `subscriptions` in the model structure are all object structures. You need to do the assignment at this level.

This can be done with the dva community's `dva-model-extend` library.

From another perspective, you could also generate a model through a factory function, for example:

```JavaScript
function createModel(options) {
  const { namespace, param } = options;
  return {
    namespace: `demo${namespace}`,
    states: {},
    reducers: {},
    effects: {
      *foo() {
        // Here we can determine the parameters of the following call according to param
        yield call()
      }
    }
  };
}

const modelA = createModel({ namespace: 'A', param: { type: 'A' } });
const modelB = createModel({ namespace: 'A', param: { type: 'B' } });
```

In this way, the extension of the model can also be implemented.

## Long Sequence Business Logic

In some use cases, the business operation can be a very long sequence. For example, in the middle of submission of a complex form, we will need to change a variety of states on the view:

**This is a real world example:**
```JavaScript
*submit(action, { put, call, select }) {
  const formData = yield select(state => {
    const buyModel = state.buy;
    const context = state.context;
    const { stock } = buyModel;
    return {
      uuid: context.uuid,
      market: stock && stock.market,
      stockCode: stock && stock.code,
      stockName: stock && stock.name,
      price: String(buyModel.price),
      // Number of orders
      entrustAmount: String(buyModel.count),
      totalBalance: buyModel.totalBalance,
      availableTzbBalance: buyModel.availableTzbBalance,
      availableDepositBalance: buyModel.availableDepositBalance,
    };
  });
  const result = yield call(post, '/h5/ajax/trade/entrust_buy', formData, { loading: true });

  if (result.success) {
    toast({
      type: 'success',
      content: 'The comission has been accepted',
    });
    // Once you have succeeded, get the current price and fill in it.
    // yield put({type: 'fetchQuotation', payload: stock});

    yield put({ type: 'entrustNoChange', payload: result.result && result.result.entrustNo });
    // Clear the contents of the input box
    yield put({ type: 'searchQueryChange', value: '' });
  }

  // 403, you need to verify the password and resubmit
  if (!result.success && result.resultCode === 403) {
    yield put({ type: 'checkPassword', payload: {} });
    return;
  }

  // After the failure, you need to update the investment treasure and the amount of the deposit.
  if (result.result) {
    yield put({ type: 'balanceChange', payload: result.result });
  }

  // Re-acquire the latest retractable list
  yield put({ type: 'fetchRevockList' });

  // If there is uuid in the returned result, replace it with new uuid
  if (result.uuid) {
    yield put({ type: 'context/updateUuid', payload: result.uuid });
  }
},
```

In an effect, multiple `put`s can be used to call the reducer to update the state.

In some other scenarios, multiple asynchronous services can be called in the effect, for example, to call the server for verification, and then to submit the data after the success. At this time, there will be multiple `call` operations in an effect.

## Using `take` to Listen to Events

Besides the situation mentioned in the previous section, we may also encounter other scenarios, such as:

`A process change that needs to spread to several other models.`

This requirement actually covers the previous section, but in this section we focus on the treatment of more general such requirements.

In redux-saga, the two operations of take and takeLatest are provided. dva is a package of redux-saga, and this operation can also be used.

To understand the semantics of the take operation, see the comparison of the two examples:

Suppose we have an event handler:

```JavaScript
someSource.on('click', event => doSomething(event))
```

If we use the generator pattern:

```JavaScript
function* saga() {
  while(true) {
     const event = yield take('click');
     doSomething(event);
  }
}
```

So, we can also use the take operation in dva to listen for actions.

## Multitasking Scheduling

In the previous section, we mentioned the serial execution of multiple tasks. This is the most common multi-tasking implementation in the business, just use a series of `yield` calls.

Sometimes, we may want multiple tasks to be executed in other ways, such as:

- **Parallel**: there are no dependencies between tasks, and subsequent operations have no dependencies on their results.
- **Competition**: between several tasks. As soon as one execution is completed, the other tasks are terminated.
- **Subtasks**: several tasks executed in parallel, but must be completed before the next batch.

### Parallel Execution of Tasks

If you want to let the tasks execute in parallel, you can achieve this in the following way:

```JavaScript
const [result1, result2]  = yield [
  call(service1, param1),
  call(service2, param2)
]
```

Put multiple things to be executed in parallel in an array. You can execute them in parallel, and when everything is over, go to the next step, similar to the operation of `promise.all`. Generally, there are some integrated interfaces, such as a dashboard, in which the business association between the components is small, and the data can be separately loaded in this way. At this time, the overall loading time depends only on the longest one.

Note: The one in the above code:

```JavaScript
yield [];
```

Do not write:

```JavaScript
yield* [];
```

The meaning of the two is different, the latter will be executed sequentially.

### Task Competition

If there is a competition between multiple tasks, you can do this in the following way:

```JavaScript
const { data, timeout } = yield race({
  data: call(service, 'some data'),
  timeout: call(delay, 1000)
});

if (data)
  put({type: 'DATA_RECEIVED', data});
else
  put({type: 'TIMEOUT_ERROR'});
```

This example cleverly uses a delay of one second of empty operations to compete with a network request. If the request is not over, it will be timed out.

This is similar to the role of `Promise.race`.

## Cross-model Communication

When the business is complicated, we may split the model, but in this case, we often encounter some more complicated things, such as:

`A process runs through multiple models`

We may have a number of different solutions to this matter. Suppose there are the following scenarios:

- Parent container A, child container B, each connected to a different model A and B
- There is an operation in the parent container, which is divided into three steps:
   - The first step is an effect in model A
   - an effect in model B to process the second step
   - After the second step, return to model A and do the third step.

In dva, you can use namespace to specify the model that accepts the action, so you can combine it in a way similar to this:

```JavaScript
yield call({ type: 'a/foo' });
yield call({ type: 'b/foo' });
yield call({ type: 'a/bar' });
```

You can even use the take command to insert logic into an effect of another model:

```JavaScript
*effectA() {
  yield call(service1);
  yield put({ type: 'service1Success' });
  // What if we reuse this effect but add one thing here?
  yield call(service2);
  yield put({ type: 'service2Success' });
}
```

You can take advantage of the take command we said before:

```JavaScript
yield take('a/service1Success');
```

In this way, you can add a parallel operation to the outside, through which you can handle some combination processes. But in reality, we may have to deal with not only the effect, but also the subsequent logic in the view component. After an action is executed, some things need to be done.

such as:

```JavaScript
yield call({ type: 'a/foo' });
yield call({ type: 'b/foo' });
// What if I want to do something in the component?
```

Some special means can be used to extend the process into the component. For example, we usually do not handle subsequent events when dispatching an action in a component, but we can modify this process:

```JavaScript
new Promise((resolve, reject) => {
  dispatch({ type: 'reusable/addLog', payload: { data: 9527, resolve, reject } });
})
.then((data) => {
  console.log(`after a long time, ${data} returns`);
});
```

Note that we are passing resolve and reject into the action, so just do this in the effect:

```JavaScript
try {
  const result = yield call(service1);
  yield put({ type: 'service1Success', payload: result });
  resolve(result);
}
catch (error) {
  yield put({ type: 'service1Fail', error });
  reject(ex);
}
```

In this way, a complex long process call across components and models is implemented.

## Writing Tests for DVA Applications

In the case of stability-seeking projects, unit testing should be used to ensure code quality. Among the various middlewares in Redux, redux-saga should be the easiest to test for the following reasons:

In an application, in addition to the view component, there may be two main logical places: reducer and effect. In both cases, the reducer is a normal function, and it is a pure function, with a single responsibility. For fixed input, there is a fixed output, so it is easy to test. And in the effect, what are we going to test? How to ensure that the test can cover an effect, is it all true?

The so-called unit test, in fact, is to test whether the logic of a function itself is completely covered, like the call to an external service (such as a network request) in an effect, the execution process of these external services is actually unit test with this module. Nothing, so we only need to verify this:

`Whether a call to a service was initiated?`

As for whether the service is being executed, regardless of the correctness of this module, that is the unit test of this service. So in this case, an effect is actually a test that translates into synchronous logic, because it is a generator function, and you can run the entire logic simply by going all the way to the effect.

Testing of redux-saga is based on such a principle, and dva is a package of redux-saga. The mechanism of this block is the same, so we can get the reducer and effect from the model object in the same way, and write test cases separately.
