import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { YahooService } from './yahoo.service';

describe('YahooService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, JsonpModule],
      providers: [YahooService]
    });
  });

  it('should be created', inject([YahooService], (service: YahooService) => {
    expect(service).toBeTruthy();
  }));
});
