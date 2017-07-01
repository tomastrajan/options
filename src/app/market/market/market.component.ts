import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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
    private yahooService: YahooService
  ) {}

  ngOnInit() {
    this.query.valueChanges
      .takeUntil(this.unsubscribe$)
      .debounceTime(200)
      .filter(q => q.length >= 3)
      .switchMap(q => this.yahooService.searchSymbol(q))
      .map(res => res.ResultSet.Result.filter(item => item.type === 'S'))
      .subscribe(results => this.queryResults = results);
  }

  onSymbolSelect(symbol: string) {
    this.result = null;
    this.loading = true;
    this.yahooService.getOptionChains(symbol)
      .subscribe(res => {
        this.result = res;
        if (this.result.options[0]) {
          this.result.options[0].calls.reverse();
          this.result.options[0].calls.forEach(i =>
            i.expiration = MarketComponent.timestampToDateString(i.expiration));
          this.result.options[0].puts.forEach(i =>
            i.expiration = MarketComponent.timestampToDateString(i.expiration));
        }
      }, () => {}, () => this.loading = false);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  static timestampToDateString(timestamp: number) {
    const date = new Date(timestamp * 1000);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
  }

}
