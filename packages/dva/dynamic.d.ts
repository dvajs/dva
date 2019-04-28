import { DvaInstance } from 'dva';
import React from 'react';

interface Config {
  app: DvaInstance,
  models?: () => PromiseLike<any>[]
  component: () => PromiseLike<any>
}

declare const dynamic: (config: Config) => React.ComponentType;
export default dynamic;
