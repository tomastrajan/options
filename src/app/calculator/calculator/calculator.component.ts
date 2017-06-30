import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import * as Chart from 'chart.js';

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
  greeks = [
    { name: 'delta', symbol: 'Δ', color: '#D85434' },
    { name: 'gamma', symbol: 'Γ', color: '#a1c64e' },
    { name: 'theta', symbol: 'Θ', color: '#4ab4a3' },
    { name: 'vega', symbol: '𝜈', color: '#dec454' },
    { name: 'rho', symbol: 'ρ', color: '#996bca' }
  ];

  parameters: FormGroup;
  values: any = {};
  chart: any;

  @ViewChild('optionChartCanvas') optionChartCanvas: ElementRef;

  constructor(private formBuilder: FormBuilder,
              private pricing: PricingService) {
    this.Math = Math;
  }

  ngOnInit() {
    const greekDatasets = this.greeks.map(greek => {
      return {
        label: `${greek.symbol} ${this.capitalize(greek.name)}`,
        backgroundColor: greek.color,
        borderColor: greek.color,
        data: [],
        yAxisID: 'greeks',
        pointRadius: 0,
        pointHitRadius: 5,
        borderWidth: 1,
        lineTension: 0,
        fill: false,
        hidden: greek.name === 'delta' ? true : false
      };
    });
    this.chart = new Chart(this.optionChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Payoff at expiry',
            backgroundColor: '#000000',
            borderColor: '#000000',
            data: [],
            yAxisID: 'payoff',
            pointRadius: 0,
            pointHitRadius: 5,
            lineTension: 0,
            borderWidth: 1,
            fill: false
          },
          {
            label: 'Theoretical P&L',
            backgroundColor: '#039be5',
            borderColor: '#039be5',
            data: [],
            yAxisID: 'payoff',
            pointRadius: 0,
            pointHitRadius: 5,
            lineTension: 0,
            borderWidth: 2,
            fill: false
          },
          ...greekDatasets
        ]

      },
      options: {
        responsive: true,
        legend: {
          labels: {
            filter(item) {
              return item.datasetIndex > 1;
            },
            usePointStyle: true
          }
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          yAxes: [
            {
              position: 'left',
              id: 'payoff',
              scaleLabel: {
                display: true,
                labelString: 'Payoff'
              }
            },
            {
              position: 'right',
              id: 'greeks',
              scaleLabel: {
                display: true,
                labelString: 'Greeks'
              },
              gridLines: { drawOnChartArea: false }
            }
          ]
        }
      }
    });

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


    const { labels, datasets } = this.chart.data;

    const isLabels = labels.length > 0;
    if (isLabels) {
      let labelsStart = labels[0];
      let labelsEnd = labels[labels.length - 1];
      while (labelsStart < start) {
        labels.shift();
        this.chart.update();
        labelsStart++;
      }
      while (labelsStart > start) {
        labelsStart--;
        labels.unshift(labelsStart);
        this.chart.update();
      }
      while (labelsEnd > end) {
        labels.pop();
        this.chart.update();
        labelsEnd--
      }
      while (labelsEnd < start) {
        labelsEnd++;
        labels.unshift(labelsEnd.toString());
        this.chart.update();
      }
    }

    for (let pricePoint = start; pricePoint <= end; pricePoint++) {
      const index = pricePoint - start;
      if (!isLabels) {
        labels.push(pricePoint.toString());
      }

      const resultExpiry = this.pricing.priceOption(type, pricePoint, strike,
        0, volatility, interest, dividends);
      const priceExpiry = position === 'buy'
        ? resultExpiry.price - currentOptionPrice
        : (resultExpiry.price * (-1)) + currentOptionPrice;

      const resultTheo = this.pricing.priceOption(type, pricePoint, strike,
        expiration, volatility, interest, dividends);
      let priceTheo = position === 'buy'
        ? resultTheo.price - currentOptionPrice
        : (resultTheo.price * (-1)) + currentOptionPrice;
      if ((position === 'buy' && priceExpiry > priceTheo)
        || (position === 'sell' && priceExpiry < priceTheo)) {
        priceTheo = priceExpiry;
      }
      const { delta, gamma, theta, vega, rho } = resultTheo;
      datasets[0].data[index] = priceExpiry.toFixed(5);
      datasets[1].data[index] = priceTheo.toFixed(5);
      datasets[2].data[index] = delta.toFixed(5);
      datasets[3].data[index] = gamma.toFixed(5);
      datasets[4].data[index] = theta.toFixed(5);
      datasets[5].data[index] = vega.toFixed(5);
      datasets[6].data[index] = rho.toFixed(5);

      this.chart.update();

    }
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
