import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { CalculatorRoutingModule } from './calculator-routing.module';
import { CalculatorComponent } from './calculator/calculator.component';
import { PricingService } from './pricing/pricing.service';
import {
  CalculatorMenuComponent
} from './calculator-menu/calculator-menu.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    CalculatorRoutingModule
  ],
  declarations: [CalculatorComponent, CalculatorMenuComponent],
  providers: [PricingService]
})
export class CalculatorModule {}
