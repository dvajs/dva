import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import dva, {
  connect,
  useDispatch,
  useSelector,
  useStore,
  createMemoryHistory,
  router,
  routerRedux,
  shallowEqual,
} from '../dist/index';

const { Link, Switch, Route, Router } = router;

afterEach(cleanup);

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

test('normal', () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });
  app.router(() => <div />);
  app.start();

  expect(app._store.getState().count).toEqual(0);
  app._store.dispatch({ type: 'count/add' });
  expect(app._store.getState().count).toEqual(1);
});

test('subscription execute multiple times', async () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    subscriptions: {
      setup({ history, dispatch }) {
        return history.listen(() => {
          dispatch({
            type: 'add',
          });
        });
      },
    },
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });

  const Count = connect(state => ({ count: state.count }))(function(props) {
    return <div data-testid="count">{props.count}</div>;
  });

  function Home() {
    return <div />;
  }

  function Users() {
    return <div />;
  }

  app.router(({ history }) => {
    return (
      <Router history={history}>
        <>
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
          <Count />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/users" component={Users} />
          </Switch>
        </>
      </Router>
    );
  });

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('count').innerHTML).toEqual('1');
  fireEvent.click(getByText('Users'));
  await delay(100);
  expect(getByTestId('count').innerHTML).toEqual('2');
  fireEvent.click(getByText('Home'));
  await delay(100);
  expect(getByTestId('count').innerHTML).toEqual('3');
});

test('connect', () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });
  const App = connect(state => ({ count: state.count }))(({ count, dispatch }) => {
    return (
      <>
        <div data-testid="count">{count}</div>
        <button
          onClick={() => {
            dispatch({ type: 'count/add' });
          }}
        >
          add
        </button>
      </>
    );
  });
  app.router(() => <App />);

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('count').innerHTML).toEqual('0');
  fireEvent.click(getByText('add'));
  expect(getByTestId('count').innerHTML).toEqual('1');
});

test('hooks api: useDispatch, useSelector shallowEqual, and useStore', () => {
  const app = dva();
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add(state) {
        return state + 1;
      },
    },
  });

  const useShallowEqualSelector = selector => useSelector(selector, shallowEqual);

  const App = () => {
    const dispatch = useDispatch();
    const store = useStore();
    const { count } = useSelector(state => ({ count: state.count }));
    const { shallowEqualCount } = useShallowEqualSelector(state => ({
      shallowEqualCount: state.count,
    }));

    return (
      <>
        <div data-testid="count">{count}</div>
        <div data-testid="shallowEqualCount">{shallowEqualCount}</div>
        <div data-testid="state">{store.getState().count}</div>
        <button
          onClick={() => {
            dispatch({ type: 'count/add' });
          }}
        >
          add
        </button>
      </>
    );
  };
  app.router(() => <App />);

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('count').innerHTML).toEqual('0');
  expect(getByTestId('shallowEqualCount').innerHTML).toEqual('0');
  fireEvent.click(getByText('add'));
  expect(getByTestId('count').innerHTML).toEqual('1');
  expect(getByTestId('shallowEqualCount').innerHTML).toEqual('1');
  expect(getByTestId('state').innerHTML).toEqual('1');
});

test('navigate', async () => {
  const history = createMemoryHistory({
    initialEntries: ['/'],
  });
  const app = dva({
    history,
  });

  function Home() {
    return <h1 data-testid="title">You are on Home</h1>;
  }
  function Users() {
    return <h1 data-testid="title">You are on Users</h1>;
  }
  app.router(({ history }) => {
    return (
      <Router history={history}>
        <>
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
          <button
            onClick={() => {
              app._store.dispatch(routerRedux.push('/'));
            }}
          >
            RouterRedux to Home
          </button>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/users" component={Users} />
          </Switch>
        </>
      </Router>
    );
  });

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('title').innerHTML).toEqual('You are on Home');
  fireEvent.click(getByText('Users'));
  await delay(100);
  expect(getByTestId('title').innerHTML).toEqual('You are on Users');
  fireEvent.click(getByText('RouterRedux to Home'));
  await delay(100);
  expect(getByTestId('title').innerHTML).toEqual('You are on Home');
});
