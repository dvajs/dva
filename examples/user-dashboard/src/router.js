import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'react-router';
import HomePage from './routes/HomePage';
import NotFound from './routes/NotFound';
import Users from './routes/Users';

export default function({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={HomePage} />
      <Route path="/users" component={Users} />
      <Route path="*" component={NotFound} />
    </Router>
  );
};
