import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { MarketRoutingModule } from './market-routing.module';
import { MarketComponent } from './market/market.component';

@NgModule({
  imports: [
    CoreModule,
    SharedModule,
    MarketRoutingModule,
  ],
  declarations: [MarketComponent]
})
export class MarketModule { }
