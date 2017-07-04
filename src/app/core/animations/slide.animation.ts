import {
  trigger, state, style, transition, animate
} from '@angular/animations';

const STYLE_INITIAL = style({ transform: 'translateY(-0.5%)', opacity: 0.5 });
const STYLE_ACTIVE = style({ transform: 'translateY(0)', opacity: 1 });

export const SLIDE_IN_DOWN_OUT_UP = trigger('slideInDownOutUp', [
  state('void', STYLE_INITIAL),
  transition('void => *', [
    animate('0.5s ease-in', STYLE_ACTIVE)
  ]),
  transition('* => void', [
    animate('0.25s ease-out', STYLE_INITIAL)
  ])
]);
