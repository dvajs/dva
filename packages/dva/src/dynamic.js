import { asyncComponent } from 'react-async-component';

const cached = {};
function registerModel(app, model) {
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

export default function(config) {
  const { app, models, component } = config;
  return asyncComponent({
    resolve() {
      return new Promise((resolve) => {
        Promise.all([...(models||[]), component]).then((ret) => {
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
