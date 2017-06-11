import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FirebaseService } from './firebase/firebase.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    FirebaseService
  ]
})
export class CoreModule { }
