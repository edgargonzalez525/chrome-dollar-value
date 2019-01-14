import {Country} from '../model/country';
import {Observable} from 'rxjs';

export class CountryService {
  public static DEFAULT_COUNTRY: Country = {
    name: 'Chile',
    topLevelDomain: [
      '.cl',
    ],
    alpha2Code: 'CL',
    alpha3Code: 'CHL',
    callingCodes: [
      '56',
    ],
    capital: 'Santiago',
    altSpellings: [
      'CL',
      'Republic of Chile',
      'República de Chile',
    ],
    region: 'Americas',
    subregion: 'South America',
    population: 18006407,
    latlng: [
      -30,
      -71,
    ],
    demonym: 'Chilean',
    area: 756102,
    gini: 52.1,
    timezones: [
      'UTC-06:00',
      'UTC-04:00',
    ],
    borders: [
      'ARG',
      'BOL',
      'PER',
    ],
    nativeName: 'Chile',
    numericCode: '152',
    currencies: [
      'CLF',
      'CLP',
    ],
    languages: [
      'es',
    ],
    translations: {
      de: 'Chile',
      es: 'Chile',
      fr: 'Chili',
      ja: 'チリ',
      it: 'Cile',
    },
    relevance: '0',
  };

  public static getCountries(): Observable<Country[]> {
    return new Observable((observable) => {
      const url = 'https://ajayakv-rest-countries-v1.p.rapidapi.com/rest/v1/all';
      const myRequest = new Request(url, {
        headers: {
          'X-RapidAPI-Key': '9659549bb5msh6c4a4a8817647f5p1c6409jsn07ef710fce8d',
        },
      });

      fetch(myRequest)
      .then(response => response.json())
      .then(json => {
        console.log(json);
        observable.next(json);
      });
    });
  }
}