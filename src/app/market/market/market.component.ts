import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';

import { ROUTE_ANIMATION, YahooService } from '@app/core';

@Component({
  selector: 'opt-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class MarketComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  routeAnimationState;
  query = new FormControl();
  queryResults: any[] = [];
  loading = false;
  result: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private yahooService: YahooService
  ) {}

  ngOnInit() {
    const { symbol } = this.route.snapshot.queryParams;
    if (symbol) {
      this.query.setValue(symbol);
      this.onSymbolSelect(symbol);
    }

    this.query.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(200)
      .filter(q => q.length >= 3)
      .switchMap(q => this.yahooService.searchSymbol(q))
      .map(res => res.ResultSet.Result.filter(item => item.type === 'S'))
      .subscribe(results => this.queryResults = results);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSymbolSelect(symbol: string) {
    this.result = null;
    this.loading = true;
    this.yahooService.getOptionChains(symbol)
      .subscribe(res => {
        this.result = res;
        if (this.result && this.result.options[0]) {
          ['calls', 'puts']
            .forEach(key => this.result.options[0][key].forEach(i => {
              i.expirationDate = MarketComponent.timestampToDate(i.expiration);
              i.impliedVolatility = (i.impliedVolatility * 100).toFixed(2);
              i.strike = i.strike.toFixed(2);
              i.bid = i.bid.toFixed(2);
              i.ask = i.ask.toFixed(2);
              i.lastPrice = i.lastPrice.toFixed(2);
            }));
          this.result.options[0].calls.reverse();
          this.router.navigate(['.'],
            { queryParams: { symbol }, relativeTo: this.route });
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
    const date = new Date(timestamp * 1000);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
  }

}
