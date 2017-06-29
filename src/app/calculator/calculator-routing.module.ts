import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  RouteAnimationGuard
} from '@app/core/animations/route-animation.guard';

import { CalculatorComponent } from './calculator/calculator.component';
import {
  CalculatorMenuComponent
} from './calculator-menu/calculator-menu.component';
import {
  ImpliedVolatilityComponent
} from './implied-volatility/implied-volatility.component';

const routes: Routes = [
  {
    path: '',
    component: CalculatorMenuComponent,
    children: [
      {
        path: '',
        redirectTo: 'option-price',
        pathMatch: 'full',
      },
      {
        path: 'option-price', component: CalculatorComponent,
        canDeactivate: [RouteAnimationGuard],
      },
      {
        path: 'implied-volatility', component: ImpliedVolatilityComponent,
        canDeactivate: [RouteAnimationGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculatorRoutingModule {
}
