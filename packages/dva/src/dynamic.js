import React, { Component } from 'react';
import invariant from 'invariant';

const cached = {};
function registerModel(app, model) {
  model = model.default || model;
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

let defaultLoadingComponent = () => null;

export default function dynamic(config) {
  const {
    resolve = defaultLoader,
  } = config;

  async function defaultLoader() {
    const {
      app,
      models: modelsLoader = () => [],
      component: componentLoader,
    } = config;
    // check config
    invariant(
      typeof componentLoader === 'function',
      `config.component should be a function and return a Promise with Compoennt,
       but it is ${typeof componentLoader}`,
    );
    // load component & models
    const [
      actualComponent,
      ...actualModels,
    ] = await Promise.all([
      componentLoader(),
      ...modelsLoader(),
    ]);
    // register models
    actualModels.forEach(
      (m) => {
        if (Array.isArray(m)) {
          m.forEach(sub => registerModel(app, sub));
        } else {
          registerModel(app, m);
        }
      },
    );
    // return component
    return actualComponent;
  }

  return class DynamicComponent extends Component {
    constructor(...args) {
      super(...args);
      this.LoadingComponent =
        config.LoadingComponent || defaultLoadingComponent;
      this.state = {
        AsyncComponent: null,
      };
      this.load();
    }

    componentDidMount() {
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    async load() {
      const compModule = await resolve();
      const AsyncComponent = compModule.default || compModule;
      if (this.mounted) {
        this.setState({ AsyncComponent });
      } else {
        this.state.AsyncComponent = AsyncComponent; // eslint-disable-line
      }
    }

    render() {
      const { AsyncComponent } = this.state;
      const { LoadingComponent } = this;
      if (AsyncComponent) return <AsyncComponent {...this.props} />;

      return <LoadingComponent {...this.props} />;
    }
  };
}

dynamic.setDefaultLoadingComponent = (LoadingComponent) => {
  defaultLoadingComponent = LoadingComponent;
};
