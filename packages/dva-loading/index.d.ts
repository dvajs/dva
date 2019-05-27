export interface DvaLoadingState {
  global: boolean;
  models: { [type: string]: boolean };
  effects: { [type: string]: boolean };
}
