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
      price: ['100', Validators.required],
      priceActive: ['100'],
      strike: ['100', Validators.required],
      strikeActive: ['100'],
      daysToExpiration: ['30', Validators.required],
      daysToExpirationActive: ['30'],
      volatility: ['25', Validators.required],
      volatilityActive: ['25'],
      interestRate: ['1', Validators.required],
      interestRateActive: ['1'],
      dividendYield: ['2', Validators.required],
      dividendYieldActive: ['2'],
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

    ['daysToExpiration', 'volatility', 'strike', 'price', 'interestRate',
      'dividendYield']
      .forEach(prop => this.parameters.get(prop).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(val => {
          const control = this.parameters.get(`${prop}Active`);
          control.setValue(val);
          val !== '0' ? control.enable() : control.disable();
        }));

    ['strikeActive', 'priceActive']
      .forEach(prop => this.parameters.get(prop).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(() => {
          const strike = parseFloat(this.parameters.get('strikeActive').value);
          const price = parseFloat(this.parameters.get('priceActive').value);
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

  updatePayoffChart(params: any) {
    const {
      type, position, priceVal, start, end, strikeVal,
      daysToExpirationVal, volatilityVal, interestRateVal, dividendYieldVal
    } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      priceVal, strikeVal, daysToExpirationVal,
      volatilityVal, interestRateVal, dividendYieldVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price,
        strikeVal, 0, volatilityVal, interestRateVal, dividendYieldVal);
      const finalPrice = position === 'buy'
        ? payoffPrice - currentOptionPrice
        : (payoffPrice * (-1)) + currentOptionPrice;
      series.push({ name: price.toString(), value: finalPrice.toFixed(5) });
    }
    const oldChartData = this.chartData;
    this.chartData = [
      { name: 'Payoff at expiry', series },
    ];
    if (oldChartData[1]) {
      this.chartData.push(oldChartData[1]);
    }
    this.chartData.push({
      name: 'X Axis', series: [
        { name: start, value: 0 }, { name: end, value: 0 }
      ]
    });
  }

  updateTheoreticalChart(params: any) {
    const {
      type, position, priceVal, start, end, strikeVal,
      daysToExpirationVal, daysToExpirationActiveVal, volatilityVal,
      interestRateVal, dividendYieldVal
    } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      priceVal, strikeVal, daysToExpirationVal, volatilityVal,
      interestRateVal, dividendYieldVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price,
        strikeVal, daysToExpirationActiveVal, volatilityVal, interestRateVal,
        dividendYieldVal);
      const finalPrice = position === 'buy'
        ? payoffPrice - currentOptionPrice
        : (payoffPrice * (-1)) + currentOptionPrice;
      series.push({ name: price.toString(), value: finalPrice.toFixed(5) });
    }
    const oldChartData = this.chartData;
    this.chartData = [{ name: 'Theoretical P&L', series }];
    if (oldChartData[0]) {
      this.chartData.unshift(oldChartData[0]);
    }
    this.chartData.push({
      name: 'X Axis', series: [
        { name: start, value: 0 }, { name: end, value: 0 }
      ]
    });
  }

  static transformParams(params: any) {
    const {
      type, position, priceActive, strikeActive, daysToExpiration,
      dividendYieldActive, daysToExpirationActive, volatilityActive,
      interestRateActive, range
    } = params;

    const strikeVal = parseFloat(strikeActive || 0);
    const priceVal = parseFloat(priceActive || 0);
    const priceDiff = priceVal * range;
    const start = Math.max(Math.ceil(priceVal - priceDiff), 0);
    const end = Math.ceil(priceVal + priceDiff);
    const daysToExpirationVal = parseFloat(daysToExpiration || 0);
    const daysToExpirationActiveVal = parseFloat(daysToExpirationActive || 0);
    const volatilityVal = parseFloat(volatilityActive || 0);
    const interestRateVal = parseFloat(interestRateActive || 0);
    const dividendYieldVal = parseFloat(dividendYieldActive || 0);

    console.log(dividendYieldVal, volatilityVal, interestRateVal,
      daysToExpirationActiveVal, daysToExpirationVal);

    return {
      type, position, priceVal, start, end, strikeVal,
      daysToExpirationVal, daysToExpirationActiveVal, volatilityVal,
      interestRateVal, dividendYieldVal
    };
  }

  static areParamsValid(params: any) {
    const {
      type, position, priceActive, strikeActive, daysToExpirationActive,
      volatilityActive, interestRateActive, dividendYieldActive
    } = params;
    return !!(type && position && priceActive !== '' && strikeActive !== ''
      && dividendYieldActive !== '' && daysToExpirationActive !== ''
      && volatilityActive !== '' && interestRateActive !== '' );
  }

  static hasRelevantParamsChanged(a, b) {
    return a.type === b.type
      && a.range === b.range
      && a.position === b.position
      && a.priceActive === b.priceActive
      && a.strikeActive === b.strikeActive
      && a.volatilityActive === b.volatilityActive
      && a.interestRateActive === b.interestRateActive
      && a.dividendYieldActive === b.dividendYieldActive
      && a.daysToExpiration === b.daysToExpiration;
  }

}
