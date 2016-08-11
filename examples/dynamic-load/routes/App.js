import React from 'react';
import { connect } from '../../../index';
import { Link } from '../../../router';

const App = ({ app }) => {
  const { name } = app;
  return (
    <div>
      <h1>{ name }</h1>
      <hr/>
      <Link to="/profile">go to /profile</Link>
    </div>
  );
};

export default connect(({ app }) => ({ app }))(App);
