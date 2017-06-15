import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  MdButtonModule,
  MdCardModule,
  MdCheckboxModule,
  MdChipsModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdProgressSpinnerModule,
  MdSelectModule,
  MdSidenavModule,
  MdTabsModule,
  MdToolbarModule,
  MdRadioModule,
  MdSliderModule,
  MdButtonToggleModule,
  MdTooltipModule,
  MdSlideToggleModule
} from '@angular/material';
import {
  SubNavigationComponent
} from './sub-navigation/sub-navigation.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,

    MdButtonModule,
    MdToolbarModule,
    MdSelectModule,
    MdTabsModule,
    MdInputModule,
    MdProgressSpinnerModule,
    MdChipsModule,
    MdCardModule,
    MdSidenavModule,
    MdCheckboxModule,
    MdListModule,
    MdMenuModule,
    MdIconModule,
    MdRadioModule,
    MdSliderModule,
    MdButtonToggleModule,
    MdTooltipModule,
    MdSlideToggleModule
  ],
  declarations: [
    SubNavigationComponent
  ],
  exports: [
    RouterModule,
    CommonModule,
    FormsModule,

    MdButtonModule,
    MdMenuModule,
    MdTabsModule,
    MdChipsModule,
    MdInputModule,
    MdProgressSpinnerModule,
    MdCheckboxModule,
    MdCardModule,
    MdSidenavModule,
    MdListModule,
    MdSelectModule,
    MdToolbarModule,
    MdIconModule,
    MdRadioModule,
    MdSliderModule,
    MdButtonToggleModule,
    MdTooltipModule,
    MdSlideToggleModule,

    SubNavigationComponent
  ]
})
export class SharedModule {}
