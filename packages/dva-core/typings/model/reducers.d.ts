import { Action, AnyAction } from 'redux';

declare module './' {
  /**
   * NOTE: We do not use Reducer type from redux. The state  will not be implictly undefined. Immer use case requires more flexiable typing as well.
   */
  interface Reducer<S = any, A extends Action = AnyAction> {
    (state: S, action: A): S;
  }

  type ReducerEnhancer<S = any> = (reducer: Reducer<S>) => Reducer<S>;

  type ReducersMapObject<S> = {
    [key: string]: Reducer<S> | [Reducer<S>, ReducerEnhancer<S>];
  };

  interface Model<S = any> {
    reducers?: ReducersMapObject<S>;
  }
}
