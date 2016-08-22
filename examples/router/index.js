import dva from '../../src/index';
import { connect } from '../../index';
import { Router, Route, Link } from '../../router';
import React from 'react';
import pathToRegexp from 'path-to-regexp';

// 1. Initialize
const app = dva();

// 2. Model
app.model({
  namespace: 'users',
  state: [
    {
      id: 1,
      name: 'foo',
    },
    {
      id: 2,
      name: 'bar',
    },
  ],
  subscriptions: {
    setup({ dispatch, history }){
      history.listen(({ pathname }, state) => {
        if (pathToRegexp('/users/:id').test(pathname)) {
          console.log(`user: ${state.params.id}`);
        }
      });
    },
  },
});

// 3. Router

const Users = (props) => {
  return (
    <div>
      User Count: {props.users.length}
      <hr/>
      <ul>
        {
          props.users.map(({id, name}) => <li key={id}><Link to={`/users/${id}`}>{name}</Link></li>)
        }
      </ul>
      <Link to="/">Go Home</Link>
    </div>
  );
};
const UsersPage = connect(({ users }) => ({ users }))(Users);

const User = (props) => {
  return (
    <div>
      User <hr />
      id: {props.user.id}<br />
      name: {props.user.name}<br />
      <hr />
      <Link to="/">Go Home</Link>
    </div>
  );
};
const UserPage = connect((state, ownProps) => {
  return {
    user: state.users.filter(user => user.id === +ownProps.params.id)[0],
  };
})(User);

const HomePage = () => (
  <div>
    Hello Dva.
    <hr />
    <Link to="/users">GO TO users</Link>
    <br />
    <Link to="/users/1">GO TO users/1</Link>
  </div>
);

app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={HomePage} />
    <Route path="/users" component={UsersPage} />
    <Route path="/users/:id" component={UserPage} />
  </Router>
);

// 4. Start
app.start('#root');
