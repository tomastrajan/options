import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';

import { ROUTE_ANIMATION, SLIDE_IN_DOWN_OUT_UP, YahooService } from '@app/core';

@Component({
  selector: 'opt-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  animations: [ROUTE_ANIMATION, SLIDE_IN_DOWN_OUT_UP]
})
export class MarketComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  viewMode = 'list';
  routeAnimationState;
  types = ['calls', 'puts'];
  query = new FormControl();
  expirationDate;
  queryResults: any[] = [];
  expirationDates: any[] = [];
  loading = false;
  result: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private yahooService: YahooService
  ) {}

  ngOnInit() {
    const { symbol, expirationDate } = this.route.snapshot.queryParams;
    if (symbol) {
      this.query.setValue(symbol);
      this.expirationDate = parseInt(expirationDate, 10);
      this.retrieveOptionChains(symbol, expirationDate);
    }

    this.query.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(200)
      .switchMap(q => this.yahooService.searchSymbol(q))
      .map(res => res.Result.filter(item => item.type === 'S'))
      .subscribe(results => this.queryResults = results);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  retrieveOptionChains(symbol: string, expirationDate?: string) {
    this.result = null;
    this.loading = true;
    this.yahooService.getOptionChains(symbol, expirationDate)
      .subscribe(res => {
        if (res && res.options) {
          this.result = res;
          this.result.calls = this.result.options[0].calls;
          this.result.puts = this.result.options[0].puts;
          this.types.forEach(key => this.result[key].forEach(i => {
            i.impliedVolatility = (i.impliedVolatility * 100).toFixed(2);
            i.strike = i.strike.toFixed(2);
            i.bid = i.bid.toFixed(2);
            i.ask = i.ask.toFixed(2);
            i.lastPrice = i.lastPrice.toFixed(2);
            i.change = i.change === 0 ? 0 : i.change.toFixed(2);
            i.percentChange = i.percentChange === 0 ? 0
              : i.percentChange.toFixed(2);
          }));
          this.result.calls.reverse();

          this.result.compact = this.result.strikes
            .map(strike => strike.toFixed(2))
            .map(strike => ({
              strike,
              call: this.result.calls.find(c => c.strike === strike),
              put: this.result.puts.find(p => p.strike === strike)
            }));

          if (!expirationDate) {
            this.expirationDate = this.result.expirationDates[0];
          }
          this.expirationDates = this.result.expirationDates
            .map(d => ({ value: d, label: MarketComponent.timestampToDate(d)}));

          console.log(this.result);

          this.router.navigate(['.'], {
            queryParams: { symbol, expirationDate: this.expirationDate },
            relativeTo: this.route
          });
        }
      }, () => {}, () => this.loading = false);
  }

  onItemClick(type, item) {
    const now = new Date().getTime() / 1000;
    const { strike, impliedVolatility, expiration } = item;
    this.router.navigate(['calculators', 'option-price'], {
      queryParams: {
        type,
        strike,
        price: this.result.quote.ask || this.result.quote.postMarketPrice,
        volatility: impliedVolatility,
        expiration: Math.ceil((expiration - now) / 60 / 60 / 24),
        dividends: 0,
        interest: 0
      }
    });
  }

  static timestampToDate(timestamp: number) {
    const d = new Date(timestamp * 1000);
    let date = d.getDate().toString();
    date = date.length === 1 ? `0${date}` : date;
    let month = (d.getMonth() + 1).toString();
    month = month.length === 1 ? `0${month}` : month;
    return `${date}. ${month}. ${d.getFullYear()}`
  }

}
