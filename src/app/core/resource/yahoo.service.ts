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

  getOptionChains(symbol: string) {
    return this.http.get(`${API_OPTIONS}${symbol}`)
      .map(res => res.json().optionChain.result[0])
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

}
