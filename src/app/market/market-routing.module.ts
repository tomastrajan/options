import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteAnimationGuard } from '@app/core';

import { MarketComponent } from './market/market.component';

const routes: Routes = [
    {
      path: '',
      redirectTo: 'market',
      pathMatch: 'full',
    },
    {
      path: 'market', component: MarketComponent,
      canDeactivate: [RouteAnimationGuard],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule { }
