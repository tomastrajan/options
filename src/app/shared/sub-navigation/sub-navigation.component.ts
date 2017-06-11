import { Component, Input } from '@angular/core';

@Component({
  selector: 'opt-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent {

  @Input() navigation = [];

}
