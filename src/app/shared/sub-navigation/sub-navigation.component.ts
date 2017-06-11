import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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
    private router: Router
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

  onSelectChange() {
    this.router.navigate([this.activeNavigationItem.link])
  }

}

export interface Navigation {
  link: string;
  label: string;
  disabled?: boolean;
}
