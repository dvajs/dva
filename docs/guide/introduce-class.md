#Introductory Course

::: tip
The content comes from an introductory class that was previously prepared for internal classmates.
:::

## React Unresolved Issues

React itself is just an abstraction layer of the DOM, using components to build virtual DOMs.

If you are developing a large application, you still need to solve some problems.

* Communication: How do you communicate between components?
* Data flow: How is the data concatenated with the view? How are routes and data bound? How to write asynchronous logic? and many more

## Communication Problem
There are three kinds of communication happening to the component.

* Send a message to a subcomponent
* Send a message to the parent component
* Send messages to other components

React only provides a means of communication: passing parameters. For large applications, it is very inconvenient.

## Example of Component Communication

### step 1

```js
class Son extends React.Component {
  render() {
    return <input/>;
  }
}

class Father extends React.Component {
  render() {
    return <div>
      <Son/>
      <p>This shows the contents of the Son component.</p>
    </div>;
  }
}

ReactDOM.render(<Father/>, mountNode);
```

Looking at this example, think about how the parent component gets the value of the child component.

### Step 2

```js
class Son extends React.Component {
  render() {
    return <input onChange={this.props.onChange}/>;
  }
}

class Father extends React.Component {
  constructor() {
    super();
    this.state = {
      son: ""
    }
  }
  changeHandler(e) {
    this.setState({
      son: e.target.value
    });
  }
  render() {
    return <div>
      <Son onChange={this.changeHandler.bind(this)}/>
      <p>Show the contents of the Son component here：{this.state.son}</p>
    </div>;
  }
}

ReactDOM.render(<Father/>, mountNode);
```

Look at this example, read the source code, understand how the child component uses the function passed in by the parent component, and passes its own value back to the parent component.

## Data Flow Problem

The current popular data flow solutions are:

* Flux, a one-way data flow scheme, represented by [Redux](https://github.com/reactjs/redux)
* Reactive, responsive data streaming solution, represented by [Mobx](https://github.com/mobxjs/mobx)
* Others, such as rxjs, etc.

Which architecture is best for React?

## The Most Popular Data Flow Solution at Present

As of 2017.1, the most popular community React application architecture is as follows.

* Routing: [React-Router](https://github.com/ReactTraining/react-router/tree/v2.8.1)
* Architecture: [Redux](https://github.com/reactjs/redux)
* Asynchronous operation: [Redux-saga](https://github.com/yelouafi/redux-saga)

Disadvantage: Introduces multiple libraries, the project structure is complex.

## dva, What is It?

Dva is a React application framework developed by the Experience Technology Department. It wraps the above three React tool libraries together, simplifying the API and making developing React applications more convenient and faster.

dva = React-Router + Redux + Redux-saga

## The Simplest Structure of a dva Application
```js
import dva from 'dva';
const App = () => <div>Hello dva</div>;

// Create an app
const app = dva();
// Registration view
app.router(() => <App />);
// Launch application
app.start('#root');
```

## Data Flow Diagram

<img src="https://zos.alipayobjects.com/rmsportal/hUFIivoOFjVmwNXjjfPE.png" width="460" height="290" /> 

## Core Idea
* State: an object that holds the entire application state
* View: View layer composed of React components
* Action: an object describing an event
* connect method: a function that binds State to View
* dispatch method: a function that sends an Action to the State

## State and View
State is where the data is stored. After the Action is received, the data is updated.

View is the UI layer of React components. After fetching data from State, it is rendered into HTML code. Whenever the State changes, the View is automatically updated.

## Action
Action is an object used to describe UI layer events.

```js
{
  type: 'click-submit-button',
  payload: this.form.data
}
```

## connect Method

`connect` is a function that binds State to View.

```js
import { connect } from 'dva';

function mapStateToProps(state) {
  return { todos: state.todos };
}
connect(mapStateToProps)(App);
```

The `connect` method returns a React component, often referred to as a container component. Because it is a container for the original UI component, it is a layer of State outside.

The first argument passed in by the `connect` method is the `mapStateToProps` function, and the `mapStateToProps` function returns an object that establishes the state-to-props mapping.

## dispatch Method
`dispatch` is a method that is used to send an Action to a State.

```js
dispatch({
  type: 'click-submit-button',
  payload: this.form.data
})
```

Where does the `dispatch` method come from? The component that is connected will automatically have a dispatch method in props.

> Where does the data for connect come from?

## The Simplest Structure of a dva Application (With Model)
```js
// Create an app
const app = dva();

// Register Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1 },
  },
  effects: {
    *addAfter1Second(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
    },
  },
});

// Registration view
app.router(() => <ConnectedApp />);

// Launch application
app.start('#root');
```

## Data Flow Diagram 1

<img src="https://zos.alipayobjects.com/rmsportal/cyzvnIrRhJGOiLliwhcZ.png" width="450" height="380" />

## Data Flow Diagram 2

<img src="https://zos.alipayobjects.com/rmsportal/pHTYrKJxQHPyJGAYOzMu.png" width="607" height="464" />

## app.model

Dva provides the app.model object, and all application logic is defined on it.

```js
const app = dva();

// add this line
app.model({ /**/ });

app.router(() => <App />);
app.start('#root');
```

## Example of a Model Object

```js
{
  namespace: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1 },
  },
  effects: {
    *addAfter1Second(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
    },
  },
}
```

## Model Object Properties

* namespace: The name of the current model. The state of the entire application, composed of multiple small Model states with namespace as key
* state: The current state of the model. The data is saved here, which directly determines the output of the view layer.
* reducers: Action handlers that handle synchronous actions to calculate the latest State
* effects: Action handler, handling asynchronous actions

## Reducer

The Reducer is an Action handler that handles synchronous operations and can be thought of as a state calculator. Its role is to calculate the current State from the previous State based on the Action.

Some examples:

```js
// count +1
function add(state) { return state + 1; }

// Add a new todo to []
function addTodo(state, action) { return [...state, action.payload]; }

// Add a new todo to { todos: [], loading: true }，and mark loading as false
function addTodo(state, action) {
  return {
    ...state,
    todos: state.todos.concat(action.payload),
    loading: false
  };
}
```

## Effect

The Action handler, which handles asynchronous actions, is based on the Redux-saga implementation. Effect refers to side effects. According to functional programming, operations other than calculations belong to Effect, typically I/O operations, database read and write.

```js
function *addAfter1Second(action, { put, call }) {
  yield call(delay, 1000);
  yield put({ type: 'add' });
}
```

## Generator Function

Effect is a Generator function that internally uses the yield keyword to identify the operation of each step (whether asynchronous or synchronous).

## call and put

Dva provides a number of handlers inside the effect function. The more common ones are `call` and `put`.

* call: execute asynchronous function
* put: emit an Action, similar to dispatch

## Classroom Exercise
Write a list containing the delete button and delay the deletion of 1 second to perform the delete.

<img src="https://zos.alipayobjects.com/rmsportal/qEVcuGVcKMGjlUNghHel.gif" />
