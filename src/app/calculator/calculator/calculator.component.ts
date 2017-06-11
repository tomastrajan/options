import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { PricingService } from '../pricing/pricing.service';

@Component({
  selector: 'opt-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {


  parameters: FormGroup;
  chartData: any[] = [];
  scheme = { domain: ['#aaaaaa', '#039be5', '#111111', '#000000'] };

  constructor(private formBuilder: FormBuilder,
              private pricing: PricingService) {
  }

  ngOnInit() {
    this.parameters = this.formBuilder.group({
      type: ['call'],
      position: ['buy'],
      currentPrice: ['100', Validators.required],
      strike: ['100', Validators.required],
      daysToExpiration: ['30', Validators.required],
      daysToExpirationActive: ['30'],
      volatility: ['25', Validators.required],
      interestRate: ['5', Validators.required],
    });

    this.parameters.valueChanges
      .debounceTime(150)
      .filter(CalculatorComponent.areParamsValid)
      .distinctUntilChanged(CalculatorComponent.hasRelevantParamsChanged)
      .map(CalculatorComponent.transformParams)
      .subscribe(this.updatePayoffChart.bind(this));

    this.parameters.valueChanges
      .debounceTime(150)
      .filter(CalculatorComponent.areParamsValid)
      .map(CalculatorComponent.transformParams)
      .subscribe(this.updateTheoreticalChart.bind(this));

    this.parameters.get('daysToExpiration').valueChanges
      .subscribe(val =>
        this.parameters.get('daysToExpirationActive').setValue(val));

    this.parameters.updateValueAndValidity();
  }

  onSliderUpdate(prop, value) {
    this.parameters.get(prop).setValue(value);
  }

  updatePayoffChart(params: any) {
    const { type, position, currentPriceVal, start, end, strikeVal,
      daysToExpirationVal, volatilityVal, interestRateVal } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      currentPriceVal, strikeVal, daysToExpirationVal,
      volatilityVal, interestRateVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price,
        strikeVal, 0, volatilityVal, interestRateVal);
      console.log(currentPriceVal, price, payoffPrice);
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
      interestRateVal } = params;

    const currentOptionPrice = this.pricing.priceOption(type,
      currentPriceVal, strikeVal, daysToExpirationVal, volatilityVal,
      interestRateVal);

    const series = [];
    for (let price = start; price <= end; price++) {
      const payoffPrice = this.pricing.priceOption(type, price + 0.001,
        strikeVal, daysToExpirationActiveVal, volatilityVal, interestRateVal);
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
      type, position, currentPrice, strike, daysToExpiration,
      daysToExpirationActive, volatility, interestRate
    } = params;

    const strikeVal = parseFloat(strike);
    const strikeDiffMin = strikeVal - strikeVal * 0.1;
    const strikeDiffMax = strikeVal + strikeVal * 0.1;
    const currentPriceVal = parseFloat(currentPrice);
    const currentPriceDiff = currentPriceVal * 0.25;
    const start = Math.ceil(Math.min(currentPriceVal - currentPriceDiff,
      strikeDiffMin));
    const end = Math.ceil(Math.max(currentPriceVal + currentPriceDiff,
      strikeDiffMax));
    const daysToExpirationVal = parseFloat(daysToExpiration);
    const daysToExpirationActiveVal = parseFloat(daysToExpirationActive);
    const volatilityVal = parseFloat(volatility);
    const interestRateVal = parseFloat(interestRate);

    return { type, position, currentPriceVal, start, end, strikeVal,
      daysToExpirationVal, daysToExpirationActiveVal, volatilityVal,
      interestRateVal };
  }

  static areParamsValid(params: any) {
    const {
      type, position, currentPrice, strike, daysToExpirationActive, volatility,
      interestRate
    } = params;
    return !!(type && position && currentPrice && strike
      && daysToExpirationActive !== '' && volatility && interestRate);
  }

  static hasRelevantParamsChanged(a, b) {
    return a.type === b.type
      && a.position === b.position
      && a.currentPrice === b.currentPrice
      && a.strike === b.strike
      && a.volatility === b.volatility
      && a.interestRate === b.interestRate;
  }


}
