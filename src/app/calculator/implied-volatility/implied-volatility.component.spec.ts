import { APP_BASE_HREF } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '@app/shared';

import { PricingService } from '../pricing/pricing.service';
import { ImpliedVolatilityComponent } from './implied-volatility.component';

describe('ImpliedVolatilityComponent', () => {
  let component: ImpliedVolatilityComponent;
  let fixture: ComponentFixture<ImpliedVolatilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        PricingService
      ],
      declarations: [ImpliedVolatilityComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpliedVolatilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
