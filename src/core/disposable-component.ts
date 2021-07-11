import {Subscription, TeardownLogic} from 'rxjs';
import {Directive, OnDestroy} from '@angular/core';

import './observable-extensions';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class DisposableComponent implements OnDestroy {
  private _subscriptions: Subscription = new Subscription();

  public addSubscription(teardown: TeardownLogic) {
    this._subscriptions.add(teardown);
  }

  ngOnDestroy(): void {
    // console.log('Unsubscribe!', this);
    this._subscriptions.unsubscribe();
  }
}
