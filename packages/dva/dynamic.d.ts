// interface Idynamic {
//   app: any, models?: any, component: any,
//   resolve?:(value?: PromiseLike<any>) => void,
// }

import { DvaInstance } from 'dva';
import React from 'react';

interface Config {
  app: DvaInstance;
  component: () => PromiseLike<any>;
  models?: () => PromiseLike<any>[];
  resolve?: () => PromiseLike<any>;
  LoadingComponent?: React.ComponentType;
}

declare function dynamic(config: Config): any;
declare namespace dynamic {
  function setDefaultLoadingComponent(LoadingComponent: React.ComponentType): void;
}

export default dynamic;
