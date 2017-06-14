import { Component, OnInit, OnDestroy } from '@angular/core';
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

  zoomChangeStep = 0.05;
  parameters: FormGroup;
  chartData: any[] = [];
  scheme = { domain: ['#aaaaaa', '#039be5', '#111111', '#000000'] };

  constructor(
    private formBuilder: FormBuilder,
    private pricing: PricingService
  ) {}

  ngOnInit() {
    this.parameters = this.formBuilder.group({
      type: ['call'],
      position: ['buy'],
      currentPrice: ['100', Validators.required],
      strike: ['100', Validators.required],
      daysToExpiration: ['30', Validators.required],
      daysToExpirationActive: ['30'],
      volatility: ['25', Validators.required],
      volatilityActive: ['25'],
      interestRate: ['5', Validators.required],
      dividendYield: ['0', Validators.required],
      range: [0.25],
    });

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .distinctUntilChanged(CalculatorComponent.hasRelevantParamsChanged)
      .map(CalculatorComponent.transformParams)
      .subscribe(this.updatePayoffChart.bind(this));

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .map(CalculatorComponent.transformParams)
      .subscribe(this.updateTheoreticalChart.bind(this));

    ['daysToExpiration', 'volatility']
      .forEach(prop => this.parameters.get(prop).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(val => {
          const control = this.parameters.get(`${prop}Active`);
          control.setValue(val);
          val !== 0 ? control.enable() : control.disable();
        }));

    ['strike', 'currentPrice']
      .forEach(prop => this.parameters.get(prop).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(() => {
          const strikeVal = parseFloat(this.parameters.get('strike').value);
          const priceVal = parseFloat(this.parameters.get('currentPrice').value);
          const range = this.parameters.get('range').value;
          const strikeDiff = strikeVal + strikeVal * 0.1;
          this.parameters.get('range')
            .setValue(Math.min((strikeDiff / priceVal) - 1, 1));
        }));


    this.parameters.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();
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

  updatePayoffChart(params: any) {
    const { type, position, currentPriceVal, start, end, strikeVal,
      daysToExpirationVal, volatilityVal, interestRateVal, dividendYieldVal
    } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      currentPriceVal, strikeVal, daysToExpirationVal,
      volatilityVal, interestRateVal, dividendYieldVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price,
        strikeVal, 0, volatilityVal, interestRateVal, dividendYieldVal);
      const finalPrice = position === 'buy'
        ? payoffPrice - currentOptionPrice
        : (payoffPrice  * (-1)) + currentOptionPrice;
      series.push({ name: price.toString(), value: finalPrice.toFixed(5) });
    }
    const oldChartData = this.chartData;
    this.chartData = [
      { name: 'Payoff at expiry', series },
    ];
    if (oldChartData[1]) {
      this.chartData.push(oldChartData[1]);
    }
    this.chartData.push({ name: 'X Axis', series: [
      { name: start, value: 0 }, { name: end, value: 0 }
    ]})
  }

  updateTheoreticalChart(params: any) {
    const { type, position, currentPriceVal, start, end, strikeVal,
      daysToExpirationVal, daysToExpirationActiveVal, volatilityVal,
      interestRateVal, dividendYieldVal } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      currentPriceVal, strikeVal, daysToExpirationVal, volatilityVal,
      interestRateVal, dividendYieldVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price,
        strikeVal, daysToExpirationActiveVal, volatilityVal, interestRateVal,
        dividendYieldVal);
      const finalPrice = position === 'buy'
        ? payoffPrice - currentOptionPrice
        : (payoffPrice  * (-1)) + currentOptionPrice;
      series.push({ name: price.toString(), value: finalPrice.toFixed(5) });
    }
    const oldChartData = this.chartData;
    this.chartData = [{ name: 'Theoretical P&L', series }];
    if (oldChartData[0]) {
      this.chartData.unshift(oldChartData[0]);
    }
    this.chartData.push({ name: 'X Axis', series: [
      { name: start, value: 0 }, { name: end, value: 0 }
    ]})
  }

  static transformParams(params: any) {
    const {
      type, position, currentPrice, strike, daysToExpiration, dividendYield,
      daysToExpirationActive, volatilityActive, interestRate, range
    } = params;

    const strikeVal = parseFloat(strike);
    const currentPriceVal = parseFloat(currentPrice);
    const currentPriceDiff = currentPriceVal * range;
    const start = Math.max(Math.ceil(currentPriceVal - currentPriceDiff), 0);
    const end = Math.ceil(currentPriceVal + currentPriceDiff);
    const daysToExpirationVal = parseFloat(daysToExpiration);
    const daysToExpirationActiveVal = parseFloat(daysToExpirationActive);
    const volatilityVal = parseFloat(volatilityActive);
    const interestRateVal = parseFloat(interestRate);
    const dividendYieldVal = parseFloat(dividendYield);

    return { type, position, currentPriceVal, start, end, strikeVal,
      daysToExpirationVal, daysToExpirationActiveVal, volatilityVal,
      interestRateVal, dividendYieldVal };
  }

  static areParamsValid(params: any) {
    const {
      type, position, currentPrice, strike, daysToExpirationActive,
      volatilityActive, interestRate, dividendYield
    } = params;
    return !!(type && position && currentPrice && strike ** dividendYield
      && daysToExpirationActive !== '' && volatilityActive && interestRate );
  }

  static hasRelevantParamsChanged(a, b) {
    return a.type === b.type
      && a.range === b.range
      && a.position === b.position
      && a.currentPrice === b.currentPrice
      && a.strike === b.strike
      && a.volatilityActive === b.volatilityActive
      && a.interestRate === b.interestRate
      && a.dividendYield === b.dividendYield
      && a.daysToExpiration === b.daysToExpiration;
  }

}
