
/// <reference path="./reducers.d.ts" />
/// <reference path="./effects.d.ts" />
/// <reference path="./subscriptions.d.ts" />
export interface Model<S = any> {
  namespace: keyof import('react-redux').DefaultRootState;
  state: S;
}
