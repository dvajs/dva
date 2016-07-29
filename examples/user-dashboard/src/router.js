import React from 'react';
import { Router, Route } from 'dva/router';
import HomePage from './routes/HomePage';
import NotFound from './routes/NotFound';
import Users from './routes/Users';

/* eslint react/prop-types:0 */
export default function ({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={HomePage} />
      <Route path="/users" component={Users} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
