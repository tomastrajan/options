import { Component, OnInit } from '@angular/core';
import { ROUTE_ANIMATION } from '@app/core/animations/route.animation';

@Component({
  selector: 'opt-implied-volatility',
  templateUrl: './implied-volatility.component.html',
  styleUrls: ['./implied-volatility.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class ImpliedVolatilityComponent implements OnInit {

  routeAnimationState;

  constructor() { }

  ngOnInit() {
  }

}
