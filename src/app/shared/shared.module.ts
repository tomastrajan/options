import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  MdAutocompleteModule,
  MdSlideToggleModule
} from '@angular/material';
import {
  SubNavigationComponent
} from './sub-navigation/sub-navigation.component';
import {
  PositiveNegativeDirective
} from './directives/positive-negative.directive';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

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
    MdAutocompleteModule,
    MdSlideToggleModule
  ],
  declarations: [
    SubNavigationComponent,
    PositiveNegativeDirective
  ],
  exports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

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
    MdAutocompleteModule,
    MdSlideToggleModule,

    SubNavigationComponent,
    PositiveNegativeDirective
  ]
})
export class SharedModule {}
