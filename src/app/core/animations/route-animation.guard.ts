import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

import {
  ROUTE_ANIMATION_DEACTIVATE_DURATION,
  ROUTE_DEACTIVATE_STATE
} from './route.animation';

export class RouteAnimationGuard implements CanDeactivate<any> {
  canDeactivate(component): Observable<boolean> {
    if (component) {
      component.routeAnimationState = ROUTE_DEACTIVATE_STATE;
    }
    return component ?
      Observable.of(true).delay(ROUTE_ANIMATION_DEACTIVATE_DURATION)
      : Observable.of(true);
  }
}
