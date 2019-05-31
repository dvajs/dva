import React, { Component } from 'react';

const cached = {};
function registerModel(app, model) {
  model = model.default || model;
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

let defaultLoadingComponent = () => null;

function asyncComponent(config) {
  const { resolve } = config;

  return class DynamicComponent extends Component {
    constructor(...args) {
      super(...args);
      this.LoadingComponent = config.LoadingComponent || defaultLoadingComponent;
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

    load() {
      resolve().then(m => {
        const AsyncComponent = m.default || m;
        if (this.mounted) {
          this.setState({ AsyncComponent });
        } else {
          this.state.AsyncComponent = AsyncComponent; // eslint-disable-line
        }
      });
    }

    render() {
      const { AsyncComponent } = this.state;
      const { LoadingComponent } = this;
      if (AsyncComponent) return <AsyncComponent {...this.props} />;

      return <LoadingComponent {...this.props} />;
    }
  };
}

export default function dynamic(config) {
  const { app, models: resolveModels, component: resolveComponent } = config;
  return asyncComponent({
    resolve:
      config.resolve ||
      function() {
        const models = typeof resolveModels === 'function' ? resolveModels() : [];
        const component = resolveComponent();
        return new Promise(resolve => {
          Promise.all([...models, component]).then(ret => {
            if (!models || !models.length) {
              return resolve(ret[0]);
            } else {
              const len = models.length;
              ret.slice(0, len).forEach(m => {
                m = m.default || m;
                if (!Array.isArray(m)) {
                  m = [m];
                }
                m.map(_ => registerModel(app, _));
              });
              resolve(ret[len]);
            }
          });
        });
      },
    ...config,
  });
}

dynamic.setDefaultLoadingComponent = LoadingComponent => {
  defaultLoadingComponent = LoadingComponent;
};
