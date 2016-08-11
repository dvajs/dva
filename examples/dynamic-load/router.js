import React from 'react';
import { Router, Route } from '../../router';

export default function({ history, app }) {

  const routes = [
    {
      path: '/',
      name: 'app',
      getComponent(nextState, cb) {
        require.ensure([], require => {
          app.model(require('./models/app'));
          cb(null, require('./routes/App'));
        });
      },
    },
    {
      path: '/profile',
      name: 'profile',
      getComponent(nextState, cb) {
        require.ensure([], require => {
          app.model(require('./models/profile'));
          cb(null, require('./routes/Profile'));
        });
      },
    },
  ];

  return <Router history={ history } routes={ routes } />;
}
