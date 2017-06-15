import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';

import { PricingService } from '../pricing/pricing.service';

@Component({
  selector: 'opt-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();
  private zoomChangeThresholdMin = 0.11;

  Math: Math;
  zoomChangeStep = 0.05;
  parameters: FormGroup;
  chartData: any[] = [];
  scheme = { domain: ['#aaaaaa', '#039be5', '#111111', '#000000'] };
  showAdvancedSimulationControls = false;

  constructor(
    private formBuilder: FormBuilder,
    private pricing: PricingService
  ) {
    this.Math = Math;
  }

  ngOnInit() {
    this.parameters = this.formBuilder.group({
      type: ['call'],
      position: ['buy'],
      priceBase: [100, Validators.required],
      price: [100],
      strikeBase: [100, Validators.required],
      strike: [100],
      expirationBase: [30, Validators.required],
      expiration: [30],
      volatilityBase: [25, Validators.required],
      volatility: [25],
      interestBase: [5, Validators.required],
      interest: [5],
      dividendsBase: [1, Validators.required],
      dividends: [1],
      range: [0.25],
    });

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .distinctUntilChanged(CalculatorComponent.areParamsEqual)
      .subscribe(this.updateChart.bind(this, 0));

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .subscribe(this.updateChart.bind(this, 1));

    ['price', 'strike', 'expiration', 'volatility', 'interest', 'dividends']
      .forEach(prop => this.parameters.get(`${prop}Base`).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(val => {
          const control = this.parameters.get(prop);
          control.setValue(val);
          val !== 0 ? control.enable() : control.disable();
        }));

    ['strike', 'price']
      .forEach(prop => this.parameters.get(prop).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(() => {
          const strike = this.parameters.get('strike').value;
          const price = this.parameters.get('price').value;
          const range = this.parameters.get('range').value;
          const strikeDiff = strike >= price
            ? strike + strike * 0.2
            : strike - strike * 0.2;
          const ratio = strike >= price
            ? strikeDiff / price
            : price / strikeDiff;
          this.parameters.get('range').setValue(Math.min(ratio - 1, 1));
        }));


    this.parameters.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSliderUpdate(prop, value) {
    this.parameters.get(prop).setValue(value);
  }

  onZoomClick(zoomChange: number) {
    const range = this.parameters.get('range');
    if (zoomChange > 0 || range.value > this.zoomChangeThresholdMin) {
      range.setValue(range.value + zoomChange);
    }
  }

  onRestoreClick() {
    const params = this.parameters.getRawValue();
    Object.keys(params)
      .filter(key => key.includes('Base'))
      .forEach(key => this.parameters.get(key.replace('Base', ''))
        .setValue(params[key]));
  }

  updateChart(index: number, params: any) {
    const {
      type, position, price = 0, strike = 0, expirationBase = 0, dividends = 0,
      expiration = 0, volatility = 0, interest = 0, range
    } = params;

    console.log.apply(console, arguments);

    const priceDiff = price * range;
    const start = Math.max(Math.ceil(price - priceDiff), 0);
    const end = Math.ceil(price + priceDiff);
    const pricePointDaysToExpiration = index === 0 ? 0 : expiration;

    const currentOptionPrice = this.pricing.priceOption(type, price, strike,
      expirationBase, volatility, interest, dividends);

    const series = [];
    for (let pricePoint = start; pricePoint <= end; pricePoint++) {
      const payoffPrice = this.pricing.priceOption(type, pricePoint, strike,
        pricePointDaysToExpiration, volatility, interest, dividends);
      const buySellAdjustedPricePoint = position === 'buy'
        ? payoffPrice - currentOptionPrice
        : (payoffPrice * (-1)) + currentOptionPrice;
      series.push({
        name: pricePoint.toString(),
        value: buySellAdjustedPricePoint.toFixed(5)
      });
    }

    const oldChartData = this.chartData;
    if (index === 0) {
      this.chartData = [{ name: 'Payoff at expiry', series }];
      if (oldChartData[1]) { this.chartData.push(oldChartData[1]); }
    } else if (index === 1) {
      this.chartData = [{ name: 'Theoretical P&L', series }];
      if (oldChartData[0]) { this.chartData.unshift(oldChartData[0]); }
    }

    this.chartData.push({
      name: 'X Axis', series: [
        { name: start, value: 0 }, { name: end, value: 0 }
      ]
    });
  }

  static areParamsValid(params: any) {
    const {
      price, strike, expiration, volatility, interest, dividends
    } = params;
    return price !== null && strike !== null
      && dividends !== null && expiration !== null
      && volatility !== null && interest !== null;
  }

  static areParamsEqual(a, b) {
    return a.type === b.type
      && a.range === b.range
      && a.position === b.position
      && a.price === b.price
      && a.strike === b.strike
      && a.volatility === b.volatility
      && a.interest === b.interest
      && a.dividends === b.dividends
      && a.expirationBase === b.expirationBase;
  }

}
