import { DvaInstance } from 'dva';
import React from 'react';

interface Config {
  app: DvaInstance;
  component: () => PromiseLike<any>;
  models?: () => PromiseLike<any>[];
  resolve?: () => PromiseLike<any>;
  LoadingComponent?: React.ComponentType;
}

declare const dynamic: (config: Config) => React.ComponentType;
export default dynamic;
