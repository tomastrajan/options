import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ROUTE_ANIMATION } from '@app/core/animations/route.animation';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';

import { PricingService } from '../pricing/pricing.service';

@Component({
  selector: 'opt-implied-volatility',
  templateUrl: './implied-volatility.component.html',
  styleUrls: ['./implied-volatility.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class ImpliedVolatilityComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  routeAnimationState;
  parameters;
  Math;
  impliedVolatility;

  constructor(private formBuilder: FormBuilder,
              private pricing: PricingService) {
    this.Math = Math;
  }

  ngOnInit() {
    this.parameters = this.formBuilder.group({
      type: ['call'],
      price: [100, Validators.required],
      strike: [100, Validators.required],
      expiration: [30, Validators.required],
      interest: [5, Validators.required],
      dividends: [1, Validators.required],
      market: [1, Validators.required]
    });

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(ImpliedVolatilityComponent.areParamsValid)
      .subscribe(this.calculateImpliedVolatility.bind(this));

    this.parameters.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSliderUpdate(prop, value) {
    if (prop === 'market') {
      value = parseFloat(value.toFixed(2));
    }
    this.parameters.get(prop).setValue(value);
  }

  calculateImpliedVolatility(params: any) {
    const {
      type, price, strike, expiration, interest, dividends, market
    } = params;

    this.impliedVolatility = 0.5;
    let calculatedPrice;
    for (let i = 0; i < 100; i++) {
      calculatedPrice = this.pricing.priceOption(type, price, strike,
        expiration, this.impliedVolatility, interest, dividends).price;
      if (parseFloat(calculatedPrice.toFixed(2)) > market) {
        this.impliedVolatility -= (this.impliedVolatility / 10);
      } else if (parseFloat(calculatedPrice.toFixed(2)) < market) {
        this.impliedVolatility += (this.impliedVolatility / 10);
      } else {
        break;
      }
    }
  }

  static areParamsValid(params: any) {
    const {
      price, strike, expiration, interest, dividends, market
    } = params;
    return price !== null && strike !== null && dividends !== null
      && expiration !== null && interest !== null && market !== null;
  }

}
