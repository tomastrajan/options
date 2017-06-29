import { Component, OnInit } from '@angular/core';
import { ROUTE_ANIMATION } from '@app/core/animations/route.animation';

@Component({
  selector: 'opt-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class AboutComponent implements OnInit {

  routeAnimationState;

  constructor() { }

  ngOnInit() {
  }

}
