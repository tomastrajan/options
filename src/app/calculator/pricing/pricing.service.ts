import { Injectable } from '@angular/core';
import { blackScholes } from 'black-scholes';

@Injectable()
export class PricingService {

  constructor() {}

  priceOption(type: OptionType,
              currentPrice: number,
              strike: number,
              daysToExpiration: number,
              volatilityPercent: number,
              interestRatePercent: number) {
    const yearsToExpiration = daysToExpiration / 365;
    return blackScholes(currentPrice, strike, yearsToExpiration,
      volatilityPercent / 100, interestRatePercent / 100, type);
  }

}

export type OptionType = 'call' | 'put';
