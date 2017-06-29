import {
  trigger, state, style, transition, animate
} from '@angular/animations';

const DELAY = 500;
const DELAY_DEACTIVATE = DELAY / 2;

const STYLE_INITIAL = style({ transform: 'translateY(-3%)', opacity: 0.5 });
const STYLE_ACTIVE = style({ transform: 'translateY(0)', opacity: 1 });
const STYLE_REMOVED = style({ transform: 'translateY(-3%)', opacity: 0 });

export const ROUTE_DEACTIVATE_STATE = 'deactivate';

export const ROUTE_ANIMATION_DEACTIVATE_DURATION = DELAY_DEACTIVATE;

export const ROUTE_ANIMATION = trigger('routeAnimation', [
  state('void', STYLE_INITIAL),
  state(ROUTE_DEACTIVATE_STATE, STYLE_REMOVED),
  transition('void => *', [
    animate('0.5s ease-in', STYLE_ACTIVE)
  ]),
  transition('* => ' + ROUTE_DEACTIVATE_STATE, [
    animate('0.25s ease-out', STYLE_REMOVED)
  ])
]);
