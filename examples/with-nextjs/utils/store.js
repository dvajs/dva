import React from 'react';
import dva, { connect } from 'dva';
import { Provider } from 'react-redux';
import model from '../model/index';

function checkServer(req) {
  return !!req;
}

// eslint-disable-next-line
const __NEXT_DVA_STORE__ =  '__NEXT_DVA_STORE__'

function createDvaStore() {
  const app = dva();
  const isArray = Array.isArray(model);
  if (isArray) {
    model.forEach((m) => {
      app.model(m);
    });
  } else {
    app.model(model);
  }
  app.router(() => {});
  app.start();
  // eslint-disable-next-line
  const store = app._store
  return store;
}

function getOrCreateStore(req) {
  const isServer = checkServer(req);
  if (isServer) { // run in server
    console.log('server');
    return createDvaStore();
  }
  // eslint-disable-next-line
  if (!window[__NEXT_DVA_STORE__]) {
    console.log('client');
    // eslint-disable-next-line
    window[__NEXT_DVA_STORE__] = createDvaStore();
  }
  // eslint-disable-next-line
  return window[__NEXT_DVA_STORE__];
}

export default function withDva(...args) {
  return function CreateNextPage(Component) {
    const ComponentWithDva = (props = {}) => {
      const { store, initialProps } = props;
      const ConnectedComponent = connect(...args)(Component);
      return React.createElement(
        Provider,
        { store: store && store.dispatch ? store : getOrCreateStore() },
        // transfer next.js's props to the page
        React.createElement(ConnectedComponent, initialProps),
      );
    };
    ComponentWithDva.getInitialProps = async (props = {}) => {
      const isServer = checkServer();
      const store = getOrCreateStore(props.req);
      // call children's getInitialProps
      // get initProps and transfer in to the page
      const initialProps = Component.getInitialProps
        ? await Component.getInitialProps({ ...props, isServer, store })
        : {};
      return {
        store,
        initialProps,
      };
    };
    return ComponentWithDva;
  };
}
