import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import * as Chart from 'chart.js';

import { ROUTE_ANIMATION } from '@app/core/animations/route.animation';

import { PricingService } from '../pricing/pricing.service';

@Component({
  selector: 'opt-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class CalculatorComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  routeAnimationState;
  Math: Math;
  zoomChangeStep = 0.05;
  greeks = [
    { label: 'Delta', symbol: 'Δ', color: '#D85434', hidden: true },
    { label: 'Gamma', symbol: 'Γ', color: '#a1c64e', hidden: true },
    { label: 'Vega', symbol: '𝜈', color: '#dec454', hidden: true },
    { label: 'Rho', symbol: 'ρ', color: '#996bca', hidden: true },
    { label: 'Theta', symbol: 'Θ', color: '#4ab4a3', hidden: true }
  ];

  parameters: FormGroup;
  values: any = {};
  chart: any;
  refreshWholeChart = false;

  @ViewChild('optionChartCanvas') optionChartCanvas: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pricing: PricingService
  ) {
    this.Math = Math;
  }

  ngOnInit() {
    const greekDatasets = this.greeks.map(greek => {
      return {
        label: greek.label,
        backgroundColor: greek.color,
        borderColor: greek.color,
        data: [],
        yAxisID: 'greeks',
        pointRadius: 0,
        pointHitRadius: 5,
        borderWidth: 1,
        lineTension: 0,
        fill: false,
        hidden: greek.hidden
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
            borderWidth: 2,
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
        legend: { display: false },
        tooltips: {
          mode: 'index',
          intersect: false,
          bodySpacing: 8,
          titleMarginBottom: 15,
          position: 'nearest',
          backgroundColor: 'rgba(0,0,0,0.6)',
          caretPadding: 10,
          callbacks: { title: items => `Underlying price: ${items[0].xLabel}` }
        },
        hover: {
          mode: 'index',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Underlying price'
            }
          }],
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
    const {
      type, price, strike, volatility, expiration, interest, dividends
    } = this.route.snapshot.queryParams;
    this.parameters = this.formBuilder.group({
      type: [type || 'call'],
      position: ['buy'],
      priceBase: [parseFloat(price) || 100, Validators.required],
      price: [parseFloat(price) || 100],
      strikeBase: [parseFloat(strike) || 100, Validators.required],
      strike: [parseFloat(strike) || 100],
      expirationBase: [parseFloat(expiration) || 30, Validators.required],
      expiration: [parseFloat(expiration) || 30],
      volatilityBase: [parseFloat(volatility) || 25, Validators.required],
      volatility: [parseFloat(volatility) || 25],
      interestBase: [isNumber(interest) ? parseFloat(interest) : 5,
        Validators.required],
      interest: [isNumber(interest) ? parseFloat(interest) : 5],
      dividendsBase: [isNumber(dividends) ? parseFloat(dividends) : 1,
        Validators.required],
      dividends: [isNumber(dividends) ? parseFloat(dividends) : 1],
      range: [0.25],
      greeks: this.formBuilder.group(this.greeks.reduce((result, greek) => {
        result[greek.label] = [false];
        return result;
      }, {}))
    });

    let lastStrike = 100;
    this.parameters.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(250)
      .filter(CalculatorComponent.areParamsValid)
      .do(params => {
        if (lastStrike !== params.strike) {
          this.refreshWholeChart = params.strike % 1 !== 0
            || lastStrike % 1 !== 0;
          lastStrike = params.strike;
        }
      })
      .subscribe(this.updateChart.bind(this));

    ['price', 'strike', 'expiration', 'volatility', 'interest', 'dividends']
      .forEach(prop => this.parameters.get(`${prop}Base`).valueChanges
        .takeUntil(this.unsubscribe$)
        .subscribe(val => {
          const control = this.parameters.get(prop);
          control.setValue(val);
          val !== 0 ? control.enable() : control.disable();
        }));

    setTimeout(() => this.parameters.updateValueAndValidity(), 500);
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

  onGreekClick(greek) {
    greek.hidden = !greek.hidden;
    this.chart.data.datasets.some(dataset => {
      if (dataset.label === greek.label) {
        dataset.hidden = greek.hidden;
        return true;
      }
      return false;
    });
    this.chart.update();
  }

  updateChart(params: any) {
    const {
      type, position, price = 0, strike = 0, expirationBase = 0, dividends = 0,
      expiration = 0, volatility = 0, interest = 0, range
    } = params;

    const strikeDiff = Math.ceil(strike * range);
    const start = Math.max(strike - strikeDiff, 0);
    const end = strike + strikeDiff;

    const mainResult = this.pricing.priceOption(type, price, strike,
      expirationBase, volatility, interest, dividends);
    const currentOptionPrice = mainResult.price;
    CalculatorComponent
      .adjustGreekValuesForPosition(position, mainResult);
    this.values = Object.keys(mainResult).reduce((result, key) => {
      result[key] = mainResult[key].toFixed(5);
      return result;
    }, {});


    const { labels, datasets } = this.chart.data;

    const isInitialized = labels.length > 0;
    if (isInitialized) {
      let labelsStart = labels[0];
      let labelsEnd = labels[labels.length - 1];
      while (labelsStart < start) {
        labels.shift();
        datasets.forEach(dataset => dataset.data.shift());
        this.chart.update();
        labelsStart++;
      }
      while (labelsStart > start) {
        labelsStart--;
        labels.unshift(labelsStart);
        datasets.forEach(({ data }) => data.unshift(data[0]));
        this.chart.update();
      }
      while (labelsEnd > end) {
        labels.pop();
        datasets.forEach(dataset => dataset.data.pop());
        this.chart.update();
        labelsEnd--
      }
      while (labelsEnd < end) {
        labelsEnd++;
        labels.push(labelsEnd.toString());
        datasets.forEach(({ data }) => data.push(data[data.length - 1]));
        this.chart.update();
      }
    }

    if (!isInitialized || this.refreshWholeChart) {
      labels.splice(0, labels.length);
      for (let i = 0; i <= 6; i++) {
        datasets[i].data.splice(0, datasets[i].data.length);
      }
      for (let pricePoint = start; pricePoint <= end; pricePoint++) {
        labels.push(pricePoint.toString());
        const index = pricePoint - start;
        datasets[0].data[index] = '0';
        datasets[1].data[index] = '0';
      }
      this.chart.update();
      this.refreshWholeChart = false;
    }

    for (let pricePoint = start; pricePoint <= end; pricePoint++) {
      const index = pricePoint - start;

      const resultExpiry = this.pricing.priceOption(type, pricePoint, strike,
        0, volatility, interest, dividends);
      const priceExpiry = position === 'buy'
        ? resultExpiry.price - currentOptionPrice
        : (resultExpiry.price * (-1)) + currentOptionPrice;

      const resultTheo = this.pricing.priceOption(type, pricePoint, strike,
        expiration, volatility, interest, dividends);
      const isBuy = position === 'buy';
      const isCall = type === 'call';
      let priceTheo = isBuy
        ? resultTheo.price - currentOptionPrice
        : (resultTheo.price * (-1)) + currentOptionPrice;
      if ((isBuy && priceExpiry > priceTheo)
        || (!isBuy && priceExpiry < priceTheo)) {
        priceTheo = priceExpiry;
      }
      CalculatorComponent
        .adjustGreekValuesForPosition(position, resultTheo);
      const { delta, gamma, theta, vega, rho } = resultTheo;
      datasets[0].data[index] = priceExpiry.toFixed(5);
      datasets[1].data[index] = priceTheo.toFixed(5);
      datasets[2].data[index] = delta.toFixed(5);
      datasets[3].data[index] = gamma.toFixed(5);
      datasets[4].data[index] = vega.toFixed(5);
      datasets[5].data[index] = rho.toFixed(5);
      datasets[6].data[index] = theta.toFixed(5);

      this.chart.update();
    }
  }

  static areParamsValid(params: any) {
    const {
      price, strike, expiration, volatility, interest, dividends
    } = params;
    return price !== null && strike !== null
      && dividends !== null && expiration !== null
      && volatility !== null && interest !== null;
  }

  static adjustGreekValuesForPosition(position, values) {
    if (position !== 'buy') {
      values.delta = -values.delta;
      values.gamma = -values.gamma;
      values.vega = -values.vega;
      values.rho = -values.rho;
      values.theta = -values.theta;
    }
  }

}

const isNumber = item => !isNaN(+item) && isFinite(item);
