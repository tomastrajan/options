import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalculatorComponent } from './calculator/calculator.component';
import {
  CalculatorMenuComponent
} from './calculator-menu/calculator-menu.component';

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
        path: 'option-price', component: CalculatorComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculatorRoutingModule { }
