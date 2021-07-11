import {Observable, Subscription} from 'rxjs';
import {DisposableComponent} from './disposable-component';

/**
 * allow subscribe on observable with auto unsubscribe action on component destroy
 * @param component instance of DisposableComponent, on which destroy event will call unsubscribe method for subscription
 * @param next on success handler, will be passed to subscribe method
 */
function safeSubscribe<T>(this: Observable<T>, component: DisposableComponent, next?: (value: T) => void): Subscription {
  const subscription = this.subscribe(next);
  // adding new subscription to DisposableComponent, to be unsubscribe on component destroy event
  component.addSubscription(subscription);
  return subscription;
}

// using module Augmentation pattern like here https://github.com/ReactiveX/rxjs/blob/6.1.0/compat/add/observable/interval.ts
declare module 'rxjs' {
  interface Observable<T> {
    safeSubscribe: typeof safeSubscribe;
  }
}

// adding new method to Observable instance
(Observable as any).prototype.safeSubscribe = safeSubscribe;
