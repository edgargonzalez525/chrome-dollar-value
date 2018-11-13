import {Country} from '../model/country';
import {Observable, of} from 'rxjs';

export class CountryService {
  public static getCountries(): Observable<Country[]> {
    return of([
      {
        id: 1,
        code: 'CLP',
        name: 'Chile',
        url: function () {
          return 'https://www.valor-dolar.cl/currencies_rates.json';
        },
        image: 'chile.png',
        parseResponse: function (response) {
          return new Promise<number>((resolve) => {
            resolve(Number(response.currencies.find((currency) => currency.code === this.code).rate));
          });
        },
      },
      {
        id: 2,
        code: 'COP',
        name: 'Colombia',
        url: function () {
          return 'http://app.docm.co/prod/Dmservices/Utilities.svc/GetTRM';
        },
        image: 'colombia.png',
        parseResponse: function (response) {
          return new Promise<number>((resolve) => {
            resolve(Number(response));
          });
        },
      },
    ]);
  }
}