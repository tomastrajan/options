import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FirebaseService } from './firebase/firebase.service';
import { RouteAnimationGuard } from './animations/route-animation.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    RouteAnimationGuard,
    FirebaseService
  ]
})
export class CoreModule { }
