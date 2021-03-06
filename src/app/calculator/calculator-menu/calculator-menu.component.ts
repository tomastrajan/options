import { Component } from '@angular/core';

@Component({
  selector: 'opt-calculator-menu',
  templateUrl: './calculator-menu.component.html',
  styleUrls: ['./calculator-menu.component.scss']
})
export class CalculatorMenuComponent {

  navigation = [
    { link: 'option-price', label: 'Option Price' },
    { link: 'implied-volatility', label: 'Implied Volatility', badge: 'New' },
    {
      link: 'strategy-builder',
      label: 'Strategy Builder',
      disabled: true,
      badge: 'Comming Soon'
    }
  ];

}
