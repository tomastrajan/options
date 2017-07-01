import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RouteAnimationGuard } from '@app/core';

import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    canDeactivate: [RouteAnimationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticRoutingModule {
}
