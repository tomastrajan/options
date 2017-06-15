import { TestBed, inject } from '@angular/core/testing';

import { PricingService } from './pricing.service';

describe('PricingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PricingService]
    });
  });

  it('calculates bsm call', inject([PricingService],
    (service: PricingService) => {
      expect(service.bsm('call', 100, 99, 0, 0, 0, 0).price).toBe(1);
      expect(service.bsm('call', 100, 100, 0, 0, 0, 0).price).toBe(0);
      expect(service.bsm('call', 100, 100, 0.25, 0.05, 0, 30 / 365)
        .price.toFixed(4)).toBe('3.0626');
    }));

  it('calculates bsm put', inject([PricingService],
    (service: PricingService) => {
      expect(service.bsm('put', 100, 101, 0, 0, 0, 0).price).toBe(1);
      expect(service.bsm('put', 100, 100, 0, 0, 0, 0).price).toBe(0);
    }));

});
