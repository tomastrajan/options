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

  Math: Math;
  zoomChangeStep = 0.05;
  scheme = { domain: ['#aaaaaa', '#039be5', '#000000', '#000000'] };
  greeks = [
    { name: 'delta', symbol: 'Δ', color: '#D85434' },
    { name: 'gamma', symbol: 'Γ', color: '#a1c64e' },
    { name: 'theta', symbol: 'Θ', color: '#4ab4a3' },
    { name: 'vega', symbol: '𝜈', color: '#dec454' },
    { name: 'rho', symbol: 'ρ', color: '#996bca' }
  ];

  parameters: FormGroup;
  chartData: any[] = [];
  values: any = {};

  constructor(private formBuilder: FormBuilder,
              private pricing: PricingService) {
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
      greeks: this.formBuilder.group(this.greeks.reduce((result, greek) => {
        result[greek.name] = [false];
        return result;
      }, {}))
    });

    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .subscribe(this.updateChart.bind(this));

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
            ? strike + strike * 0.1
            : strike - strike * 0.1;
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
    if (zoomChange > 0 || range.value > 0.11) {
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

  updateChart(params: any) {
    const {
      type, position, price = 0, strike = 0, expirationBase = 0, dividends = 0,
      expiration = 0, volatility = 0, interest = 0, range
    } = params;

    const priceDiff = price * range;
    const start = Math.max(Math.ceil(price - priceDiff), 0);
    const end = Math.ceil(price + priceDiff);

    const mainResult = this.pricing.priceOption(type, price, strike,
      expirationBase, volatility, interest, dividends);
    const currentOptionPrice = mainResult.price;
    this.values = mainResult;

    const seriesExpiry = [];
    const seriesTheo = [];
    const seriesGreeks = {};
    for (let pricePoint = start; pricePoint <= end; pricePoint++) {
      const name = pricePoint.toString();

      const resultExpiry = this.pricing.priceOption(type, pricePoint, strike,
        0, volatility, interest, dividends);
      const priceExpiry = position === 'buy'
        ? resultExpiry.price - currentOptionPrice
        : (resultExpiry.price * (-1)) + currentOptionPrice;
      seriesExpiry.push({ name, value: priceExpiry.toFixed(5) });

      const resultTheo = this.pricing.priceOption(type, pricePoint, strike,
        expiration, volatility, interest, dividends);
      let priceTheo = position === 'buy'
        ? resultTheo.price - currentOptionPrice
        : (resultTheo.price * (-1)) + currentOptionPrice;
      if ((position === 'buy' && priceExpiry > priceTheo)
        || (position === 'sell' && priceExpiry < priceTheo)) {
        priceTheo = priceExpiry
      }
      seriesTheo.push({ name, value: priceTheo.toFixed(5) });

      this.greeks
        .map(greek => greek.name)
        .filter(greek => this.parameters.getRawValue().greeks[greek])
        .forEach(greek => {
          if (!seriesGreeks[greek]) {
            seriesGreeks[greek] = [];
          }
          seriesGreeks[greek].push({ name, value: resultTheo[greek] });
        });
    }

    if (!Object.keys(seriesGreeks).length) {
      this.chartData = [
        { name: 'Payoff at expiry', series: seriesExpiry },
        { name: 'Theoretical P&L', series: seriesTheo }
      ];
      this.scheme = { domain: ['#aaaaaa', '#039be5', '#000000', '#000000'] };

    } else {
      this.chartData = [];
      const domain = [];
      this.greeks
        .filter(greek => this.parameters.getRawValue().greeks[greek.name])
        .forEach(greek => {
          this.chartData.push({
            name: this.capitalize(greek.name),
            series: seriesGreeks[greek.name]
          });
          domain.push(greek.color);
        });
      domain.push('#000000', '#000000');
      this.scheme = { domain };
    }

    this.chartData.push({
      name: 'X Axis', series: [
        { name: start, value: 0 }, { name: end, value: 0 }
      ]
    });
  }

  capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  }

  static areParamsValid(params: any) {
    const {
      price, strike, expiration, volatility, interest, dividends
    } = params;
    return price !== null && strike !== null
      && dividends !== null && expiration !== null
      && volatility !== null && interest !== null;
  }

}
