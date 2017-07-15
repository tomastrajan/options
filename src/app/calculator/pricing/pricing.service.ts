import { Injectable } from '@angular/core';

const CACHE_TIMEOUT = 1000 * 60 * 30;

@Injectable()
export class PricingService {

  memoizationCache: any = {
    call: {},
    put: {},
  };

  constructor() {}

  priceOption(type: OptionType,
              currentPrice: number,
              strike: number,
              daysToExpiration: number,
              volatilityPercent: number,
              interestRatePercent: number,
              dividendYieldPercent: number) {
    // tslint:disable-next-line:max-line-length
    const key = `${currentPrice}-${strike}-${daysToExpiration}-${volatilityPercent}-${interestRatePercent}-${dividendYieldPercent}`
    const cachedResult = this.memoizationCache[type][key];
    if (cachedResult) {
      return Object.assign({}, cachedResult);
    } else {
      const result = this.bsm(type, currentPrice, strike,
        volatilityPercent / 100, interestRatePercent / 100,
        dividendYieldPercent / 100, daysToExpiration / 365);
      this.memoizationCache[type][key] = result;
      setTimeout(() => delete this.memoizationCache[type][key], CACHE_TIMEOUT);
      return Object.assign({}, result);
    }
  }

  /**
   * Black-Scholes-Merton Formula Parameters
   * http://www.macroption.com/black-scholes-formula/
   *
   * @param type 'call' or 'put'
   * @param s0 underlying price ($$$ per share)
   * @param x strike price ($$$ per share)
   * @param v volatility (% p.a. as decimal)
   * @param r continuously compounded risk free int. rate (% p.a. as decimal)
   * @param q continuously compounded dividend yield (% p.a. as decimal)
   * @param t time to expiration (% of year as decimal)
   */
  bsm(type: OptionType, s0: number, x: number, v: number, r: number, q: number,
      t: number): any {

    let d1 = (Math.log(s0 / x) + t * (r - q + Math.pow(v, 2) / 2))
      / (v * Math.sqrt(t));
    let d2 = d1 - v * Math.sqrt(t);
    if (Number.isNaN(d1)) { d1 = Infinity; }
    if (Number.isNaN(d2)) { d2 = Infinity; }

    const eRT = Math.pow(Math.E, -1 * r * t);
    const eQT = Math.pow(Math.E, -1 * q * t);
    const eD122 = Math.pow(Math.E, -1 * Math.pow(d1, 2) / 2);
    const sqrt2PI = Math.sqrt(2 * Math.PI);
    const gamma = ((eQT * eD122)
      / (s0 * v * Math.sqrt(t) * sqrt2PI)) || 0;
    const vega = (s0 * eQT * Math.sqrt(t) * eD122
      / (sqrt2PI * 100)) || 0;

    if (type === 'call') {
      return {
        price: s0 * eQT * this.SNCDF(d1) - x * eRT * this.SNCDF(d2),
        delta: (eQT * this.SNCDF(d1)) || 0,
        rho: ((x * t * eRT * this.SNCDF(d2)) / 100) || 0,
        theta: ((-((s0 * v * eQT * eD122) / (2 * Math.sqrt(t) * sqrt2PI))
          - (r * x * eRT * this.SNCDF(d2)) + (q * s0 * eQT * this.SNCDF(d1)))
          / 365) || 0,
        gamma,
        vega
      }
    } else {
      return {
        price: x * eRT * this.SNCDF(-d2) - s0 * eQT * this.SNCDF(-d1),
        delta: (eQT * (this.SNCDF(d1) - 1)) || 0,
        rho: ((x * t * eRT * this.SNCDF(-d2)) / -100) || 0,
        theta: ((-((s0 * v * eQT * eD122) / (2 * Math.sqrt(t) * sqrt2PI))
          + (r * x * eRT * this.SNCDF(-d2)) - (q * s0 * eQT * this.SNCDF(-d1)))
          / 365) || 0,
        gamma,
        vega
      }
    }
  }

  SNCDF(x) {
    let probability = 0;
    if (x >= 8) {
      probability = 1;
    } else if (x <= -8) {
      probability = 0;
    } else {
      for (let i = 0; i < 100; i++) {
        probability += (Math.pow(x, 2 * i + 1)
          / this.doubleFactorial(2 * i + 1));
      }
      probability *= Math.pow(Math.E, -0.5 * Math.pow(x, 2));
      probability /= Math.sqrt(2 * Math.PI);
      probability += 0.5;
    }
    return probability;
  }

  doubleFactorial(n) {
    let val = 1;
    for (let i = n; i > 1; i -= 2) {
      val *= i;
    }
    return val;
  }

}

export type OptionType = 'call' | 'put';
