import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'opt-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent implements OnInit, OnDestroy {

  @Input() navigation: Navigation[] = [];

  activeNavigationItem: Navigation;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .takeUntil(this.unsubscribe$)
      .subscribe((event: any) => {
        const { url, urlAfterRedirects } = event;
        this.activeNavigationItem = this.navigation
          .find(item => (urlAfterRedirects || url).includes(item.link));
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSelectChange(item) {
    this.activeNavigationItem = item;
    this.router.navigate([item.link], { relativeTo: this.activatedRoute });
  }

}

export interface Navigation {
  link: string;
  label: string;
  disabled?: boolean;
  badge?: string;
}
