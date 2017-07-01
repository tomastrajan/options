import { ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';

import { MarketComponent } from './market.component';

describe('MarketComponent', () => {
  let component: MarketComponent;
  let fixture: ComponentFixture<MarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [ MarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
