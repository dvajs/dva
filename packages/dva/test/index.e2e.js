import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import dva, {
  connect,
  createMemoryHistory,
  router,
  routerRedux,
} from '../dist/index';

const { Link, Switch, Route, Router } = router;

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
  const App = connect(state => ({ count: state.count }))(
    ({ count, dispatch }) => {
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
    },
  );
  app.router(() => <App />);
  app.start();

  const { getByTestId, getByText } = render(React.createElement(app.start()));
  expect(getByTestId('count').innerHTML).toEqual('0');
  fireEvent.click(getByText('add'));
  expect(getByTestId('count').innerHTML).toEqual('1');
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
  expect(getByTestId('title').innerHTML).toEqual('You are on Users');
  fireEvent.click(getByText('RouterRedux to Home'));
  expect(getByTestId('title').innerHTML).toEqual('You are on Home');
});
