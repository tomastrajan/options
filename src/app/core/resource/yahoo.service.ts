import { Injectable } from '@angular/core';
import { Http, Jsonp } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

const API_OPTIONS = 'https://crossorigin.me/'
  + 'https://query2.finance.yahoo.com/v7/finance/options/';
const API_SYMBOL = 'https://autoc.finance.yahoo.com/' +
  'autoc?query=';
const API_SYMBOL_SUFFIX = '&region=US&lang=en&callback=JSONP_CALLBACK';

@Injectable()
export class YahooService {

  constructor(
    private http: Http,
    private jsonp: Jsonp
  ) {}

  getOptionChains(symbol: string, date?: string) {
    const url = `${API_OPTIONS}${symbol}${date ? '?date=' + date : ''}`;
    return this.http.get(url)
      .map(res => res.json().optionChain.result[0])
      .map(data => this.dataRandomizer(data))
      .catch(err => {
        console.log(err);
        return Observable.of([])
      });
  }

  searchSymbol(query: string) {
    return this.jsonp.get(`${API_SYMBOL}${query}${API_SYMBOL_SUFFIX}`)
      .map(res => res.json())
      .catch(err => {
        console.log(err);
        return Observable.of([])
      });
  }

  dataRandomizer(data) {
    // to comply with yahoo TOS,
    // app serves as a technological prototype not a real stock application
    // only mock randomized data is displayed
    [
      'ask',
      'regularMarketChange',
      'regularMarketChangePercent',
      'postMarketPrice'
    ].forEach(key =>
      data.quote[key] = YahooService.numberRandomizer(data.quote[key]));

    if (data.options && data.options[0]) {
      const KEYS = [
        'bid',
        'ask',
        'impliedVolatility',
        'lastPrice',
        'volume',
        'change',
        'percentChange'
      ];
      const { calls, puts } = data.options[0];
      calls.forEach(call => {
        KEYS.forEach(key => {
          const val = call[key];
          call[key] = YahooService.numberRandomizer(call[key]);
          console.log(call.contractSymbol, key, val, call[key]);
        })
      });
      puts.forEach(put => KEYS
        .forEach(key => put[key] = YahooService.numberRandomizer(put[key])));
    }

    return data;
  }

  static numberRandomizer(value: any) {
    value = parseFloat(value);
    // randomize value by 5 to 15%;
    value = value * (1 + YahooService.getRandomRange(5, 15) / 100);
    return parseFloat(value.toFixed(2));
  }

  static getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

}
