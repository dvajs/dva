import { ComponentType } from 'react';
import { DvaInstance } from './index';

declare const dynamic: (opts: {
  app: DvaInstance,
  models?: () => PromiseLike<any>[],
  component: () => PromiseLike<any>,
}) => ComponentType<any>;
export default dynamic;
