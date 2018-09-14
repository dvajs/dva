# 使用 Dva 开发复杂 SPA

> 作者：徐飞

在dva的官方仓库里，提供了上手教程，讲述了dva的一些基本概念。到了真实的业务开发过程中，会遇到许许多多不能用那些基本操作覆盖的场景，本文尝试列举一些常见的需求在dva中的实现方式。

## 动态加载model

有不少业务场景下，我们可能会定义出很多个model，但并不需要在应用启动的时候就全部加载，比较典型的是各类管理控制台。如果每个功能页面是通过路由切换，互相之间没有关系的话，通常会使用webpack的require.ensure来做代码模块的懒加载。

我们也可以利用这个特性来做model的动态加载。

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

这样，在视图切换到这个路由的时候，对应的model就会被加载。同理，也可以做model的动态移除，不过，一般情况下是不需要移除的。

## 使用model共享全局信息

在上一节我们提到，可以动态加载model，也可以移除。从这个角度看，model是可以有不同生命周期的，有些可以与功能视图伴随，而有些可以贯穿整个应用的生命周期。

从业务场景来说，有不少场景是可以做全局model的，比如说，我们在路由之间前进后退，model可以用于在路由间共享数据，比较典型的，像列表页和详情页的互相跳转，就可以用同一份model去共享它们的数据。

注意，如果当前应用中加载了不止一个model，在其中一个的effect里面做select操作，是可以获取另外一个中的state的：

```JavaScript
*foo(action, { select }) {
  const { a, b } = yield select();
}
```

这里，a，b可以分别是两个不同model的state。所以，借助这个特点，我们就不必非要把model按照视图的结构进行组织，可以适当按照业务分类，把一些数据存在对应业务的model中，分别通过不同的effect去更新，在获取的地方再去组合，这样可以使得model拥有更好的复用性。

## model的复用

有时候，业务上可能遇到期望把一些与外部关联较少的model拆出来的需求，我们可能会拆出这样的一个model，然后用不同的视图容器去connect它。

```JavaScript
export default {
  namespace: 'reusable',
  state: {},
  reducers: {},
  effects: {}
}
```

所以，在业务上，可能出现的使用情况就是：

```
              ContainerA <-- ModelA
                   |
    ------------------------------
    |                            |
ContainerB <-- reusable     ContainerC <-- reusable
```

这里面，ContainerB和ContainerC是ContainerA的下属，它们的逻辑结构一致，只是展现不同。我们可以让它们分别connect同一个model，注意，这个时候，model的修改会同时影响到两个视图，因为model在state中是直接以namespace作key存放的，实际上只有一份实例。

## 动态扩展model

在上一节中，我们提到可以把model进行分类，以实现在若干视图中的共享，但业务需求是比较多变的，很可能我们又会遇到这种情况：

`几个业务视图长得差不多，model也存在少量差别`

这个情况下，如果我们让它们复用同一个model也可以，但这么做，对维护是一种挑战，很可能改其中一个，对另外一些造成了影响，所以这种情况下，可能会期望能够对model进行扩展。

所谓扩展，通常是要做几个事情：

- 新增一些东西
- 覆盖一些原有的东西
- 根据条件动态创建一些东西

注意到dva中的每个model，实际上都是普通的JavaScript对象，包含

- namespace
- state
- reducers
- effects
- subscriptions

从这个角度看，我们要新增或者覆盖一些东西，都会是比较容易的，比如说，使用Object.assign来进行对象属性复制，就可以把新的内容添加或者覆盖到原有对象上。

注意这里有两级，model结构中的`state`，`reducers`，`effects`，`subscriptions`都是对象结构，需要分别在这一级去做assign。

可以借助dva社区的`dva-model-extend`库来做这件事。

换个角度，也可以通过工厂函数来生成model，比如：

```JavaScript
function createModel(options) {
  const { namespace, param } = options;
  return {
    namespace: `demo${namespace}`,
    states: {},
    reducers: {},
    effects: {
      *foo() {
        // 这里可以根据param来确定下面这个call的参数
        yield call()
      }
    }
  };
}

const modelA = createModel({ namespace: 'A', param: { type: 'A' } });
const modelB = createModel({ namespace: 'A', param: { type: 'B' } });
```

这样，也能够实现对model的扩展。

## 长流程的业务逻辑

在业务中，有时候会出现较长的流程，比如说，我们的一个复杂表单的提交，中间会需要去发起多种对视图状态的操作：

**这是一个真实业务**
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
      // 委托数量
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
      content: '委托已受理',
    });
    // 成功之后再获取一次现价，并填入
    // yield put({type: 'fetchQuotation', payload: stock});

    yield put({ type: 'entrustNoChange', payload: result.result && result.result.entrustNo });
    // 清空输入框内容
    yield put({ type: 'searchQueryChange', value: '' });
  }

  // 403时，需要验证密码再重新提交
  if (!result.success && result.resultCode === 403) {
    yield put({ type: 'checkPassword', payload: {} });
    return;
  }

  // 失败之后也需要更新投资宝和保证金金额
  if (result.result) {
    yield put({ type: 'balanceChange', payload: result.result });
  }

  // 重新获取最新可撤单列表
  yield put({ type: 'fetchRevockList' });

  // 返回的结果里面如果有uuid, 用新的uuid替换
  if (result.uuid) {
    yield put({ type: 'context/updateUuid', payload: result.uuid });
  }
},
```

在一个effect中，可以使用多个put来分别调用reducer来更新状态。

存在另外一些流程，在effect中可能会存在多个异步的服务调用，比如说，要调用一次服务端的验证，成功之后再去提交数据，这时候，在一个effect中就会存在多个call操作了。

## 使用take操作进行事件监听

与上一节提到的情况相比，我们还可能遇到另外一些场景，比如：

`一个流程的变动，需要扩散到若干个其他model中`

这个需求其实也覆盖了上一节这种，但在这一节中，我们侧重讨论比较通用的这类需求的处理方式。

在redux-saga中，提供了take和takeLatest这两个操作，dva是redux-saga的封装，也是可以使用这种操作的。

要理解take操作的语义，可以参见这两种示例的对比：

假设我们有一个事件处理的代码：

```JavaScript
someSource.on('click', event => doSomething(event))
```

这段代码转成用generator来表达，就是下面这个形式：

```JavaScript
function* saga() {
  while(true) {
     const event = yield take('click');
     doSomething(event);
  }
}
```

所以，我们也可以在dva中使用take操作来监听action。

## 多任务调度

上一节我们提到的是多个任务的串行执行方式，这是业务中最常见的多任务执行方式，只需逐个yield call就可以了。

有的时候，我们可能会希望多个任务以另外一些方式执行，比如：

- 并行，若干个任务之间不存在依赖关系，并且后续操作对它们的结果无依赖
- 竞争，若干个任务之间，只要有一个执行完成，就进入下一个环节
- 子任务，若干个任务，并行执行，但必须全部做完之后，下一个环节才继续执行

### 任务的并行执行

如果想要让任务并行执行，可以通过下面这种方式：

```JavaScript
const [result1, result2]  = yield [
  call(service1, param1),
  call(service2, param2)
]
```

把多个要并行执行的东西放在一个数组里，就可以并行执行，等所有的都结束之后，进入下个环节，类似promise.all的操作。一般有一些集成界面，比如dashboard，其中各组件之间业务关联较小，就可以用这种方式去分别加载数据，此时，整体加载时间只取决于时间最长的那个。

注意：上面代码中的那个：

```JavaScript
yield [];
```

不要写成：

```JavaScript
yield* [];
```

这两者含义是不同的，后者会顺序执行。

### 任务的竞争

如果多个任务之间存在竞争关系，可以通过下面这种方式：

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

这个例子比较巧妙地用一个延时一秒的空操作来跟一个网络请求竞争，如果到了一秒，请求还没结束，就让它超时。

这个类似于Promise.race的作用。

## 跨model的通信

当业务复杂的情况下，我们可能会对model进行拆分，但在这种情况下，往往又会遇到一些比较复杂的事情，比如：

`一个流程贯穿多个model`

对这个事情，我们可能有若干中不同的解决办法。假设有如下场景：

- 父容器A，子容器B，二者各自connect了不同的model A和B
- 父容器中有一个操作，分三个步骤：
  - model A中某个effect处理第一步
  - call model B中的某个effect去处理第二步
  - 第二步结束后，再返回model A中做第三步

在dva中，可以用namespace去指定接受action的model，所以可以通过类似这样的方式去组合：

```JavaScript
yield call({ type: 'a/foo' });
yield call({ type: 'b/foo' });
yield call({ type: 'a/bar' });
```

甚至，还可以利用take命令，在另外一个model的某个effect中插入逻辑：

```JavaScript
*effectA() {
  yield call(service1);
  yield put({ type: 'service1Success' });
  // 如果我们复用这个effect，但要在这里加一件事，怎么办？
  yield call(service2);
  yield put({ type: 'service2Success' });
}
```

可以利用之前我们说的take命令：

```JavaScript
yield take('a/service1Success');
```

这样，可以在外部往里面添加一个并行操作，通过这样的组合可以处理一些组合流程。但实际情况下，我们可能要处理的不仅仅是effect，很可能视图组件中还存在后续逻辑，在某个action执行之后，还需要再做某些事情。

比如：

```JavaScript
yield call({ type: 'a/foo' });
yield call({ type: 'b/foo' });
// 如果这里是要在组件里面做某些事情，怎么办？
```

可以利用一些特殊手段把流程延伸出来到组件里。比如说，我们通常在组件中dispatch一个action的时候，不会处理后续事情，但可以修改这个过程：

```JavaScript
new Promise((resolve, reject) => {
  dispatch({ type: 'reusable/addLog', payload: { data: 9527, resolve, reject } });
})
.then((data) => {
  console.log(`after a long time, ${data} returns`);
});
```

注意这里，我们是把resolve和reject传到action里面了，所以，只需在effect里面这样处理：

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

这样，就实现了跨越组件、模型的复杂的长流程的调用。

## 为DVA应用编写测试

在比较追求稳定性的工程中，应当使用单元测试来保证代码质量。在Redux的各类中间件中，redux-saga应当是测试最简单的了，原因如下：

在一个应用中，除了视图组件之外，可能存在逻辑的地方主要是两种：reducer、effect。这两者中，reducer是普通函数，并且是纯函数，职责单一，对于固定输入，就有固定输出，所以很容易测试。而在effect中，我们所要测试的东西是什么呢？如何确保测试能够覆盖某个effect，是全部真实执行一遍吗？

所谓的单元测试，其实要测试的是某个函数自身的逻辑是否全被覆盖，像在一个effect中对外部服务（比如网络请求）的调用，这些外部服务的执行过程其实与本模块的单元测试无关，因此，我们只需要验证这件事：

`是否发起了对某个服务的调用`

至于说，这个服务是否在执行，无关于本模块的正确性，那是这个服务的单元测试要做的事。所以这么一来，一个effect实际上是转化为同步逻辑的测试，因为它是一个generator函数，只需对这个effect一路next，就能跑完整个逻辑。

对redux-saga的测试是这样的原理，而dva是对redux-saga的封装，这块的机制是一致的，所以我们可以用同样的方式，从model对象中获取reducer和effect，分别编写测试用例。 
