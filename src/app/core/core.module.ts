import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, JsonpModule } from '@angular/http';

import { FirebaseService } from './firebase/firebase.service';
import { RouteAnimationGuard } from './animations/route-animation.guard';
import { YahooService } from './resource/yahoo.service';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    JsonpModule
  ],
  declarations: [],
  providers: [
    RouteAnimationGuard,
    FirebaseService,
    YahooService
  ]
})
export class CoreModule { }
