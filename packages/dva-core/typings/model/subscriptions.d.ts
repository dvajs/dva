import { Dispatch } from 'redux';
import { History } from 'history';

declare module './' {
  interface SubscriptionAPI {
    history: History;
    dispatch: Dispatch;
  }

  type Subscription = (api: SubscriptionAPI, done: Function) => void;

  type SubscriptionsMapObject = {
    [key: string]: Subscription,
  }

  interface Model<S> {
    subscriptions?: SubscriptionsMapObject;
  }
}