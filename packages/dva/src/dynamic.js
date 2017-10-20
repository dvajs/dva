import React, { Component } from 'react';

const cached = {};
function registerModel(app, model) {
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

function asyncComponent(config) {
  const { resolve } = config;

  return class DynamicComponent extends Component {
    constructor(...args) {
      super(...args);
      this.LoadingComponent =
        config.LoadingComponent || (() => <p>loading...</p>);
      this.load();
    }

    componentDidMount() {
      this.mounted = true;
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
    resolve: config.resolve || function () {
      const models = typeof resolveModels === 'function' ? resolveModels() : [];
      const component = resolveComponent();
      return new Promise((resolve) => {
        Promise.all([...models, component]).then((ret) => {
          if (!models || !models.length) {
            return resolve(ret[0]);
          } else {
            const len = models.length;
            ret.slice(0, len).forEach((m) => {
              registerModel(app, m);
            });
            resolve(ret[len]);
          }
        });
      });
    },
    ...config,
  });
}
