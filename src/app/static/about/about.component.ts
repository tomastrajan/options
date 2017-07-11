import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ROUTE_ANIMATION, YahooService } from '@app/core';
import { MdInputDirective } from '@angular/material';

@Component({
  selector: 'opt-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [ROUTE_ANIMATION]
})
export class AboutComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  @ViewChild(MdInputDirective) queryInput: MdInputDirective;
  routeAnimationState;
  query = new FormControl();
  queryResults: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private yahooService: YahooService
  ) { }

  ngOnInit() {
    setTimeout(() => this.queryInput.focus());

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

  onSymbolSelect(symbol: string) {
    this.router.navigate(['..', 'market', 'market'],
      { relativeTo: this.route, queryParams: { symbol } });
  }

}
