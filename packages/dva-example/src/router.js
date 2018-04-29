import React from 'react';
import { routerRedux, Route, Switch } from 'dvajs/router';
import IndexPage from './routes/IndexPage';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history }) {
  return (
    <ConnectedRouter history={history}>
      <Route path="/" exact component={IndexPage} />
    </ConnectedRouter>
  );
}

export default RouterConfig;
