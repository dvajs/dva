export interface DvaErrorState {
  global: Error[];
  models: { [type: string]: Error[] };
  effects: { [type: string]: Error | undefined };
}
