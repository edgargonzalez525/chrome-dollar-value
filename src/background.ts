import * as numeral from 'numeral';

import { Country } from './model/country';
import { CountryService } from './services/country.service';

function setBadgeIcon(country: Country) {
  const c: HTMLCanvasElement = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const imageObj1 = new Image();
  const imageObj2 = new Image();
  imageObj1.src = `https://www.countryflags.io/${country.alpha2Code}/flat/16.png`;
  imageObj1.crossOrigin = 'Anonymous';
  imageObj1.onload = function () {
    ctx.drawImage(imageObj1, 0, 0, 16, 16);
    imageObj2.src = 'images/dollar-sign.png';
    imageObj2.onload = function () {
      ctx.drawImage(imageObj2, 0, 0, 16, 16);

      chrome.browserAction.setIcon({
        imageData: ctx.getImageData(0, 0, 16, 16),
      });
    };
  };
}

function getDollarValue(country: Country): Promise<number> {
  const currency: string = country.currencies[country.currencies.length - 1];

  const url = `https://okapi-currency-exchange-rates-v1.p.rapidapi.com/finance/lookup/currency?currency=USD%2C${currency}&value=1`;
  const myRequest = new Request(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '9659549bb5msh6c4a4a8817647f5p1c6409jsn07ef710fce8d',
    },
  });

  return fetch(myRequest)
  .then(response => response.json())
  .then((response: { currency: string, value: number }[]) => {
    const selected = response.find((item) => item.currency === currency);
    return selected ? selected.value : 0;
  });
}

function getBadgeText(value: number): string {
  const maxLength = 4;
  let formattedValue = numeral(value).format('0.00');

  if (formattedValue.length <= maxLength) {
    return formattedValue;
  }

  if ((formattedValue = Math.floor(value).toString()).length <= maxLength) {
    return formattedValue;
  }

  if ((formattedValue = numeral(value).format('0.0a')).length <= maxLength) {
    return formattedValue;
  }

  return numeral(value).format('0a');
}

function updateDollarValue() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['dollarValue', 'country', 'showNotifications'], function (result: { dollarValue: number, country: string, showNotifications: boolean }) {
      const dollarValue = result.dollarValue || 0;
      const selectedCountry: Country = result.country ?
        JSON.parse(result.country) :
        CountryService.DEFAULT_COUNTRY;

      getDollarValue(selectedCountry)
      .then((value) => {
        const newDollarValue = value;
        const state = {
          dollarValue: newDollarValue,
          lastChecked: new Date().toISOString(),
        };
        chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 20]});
        chrome.browserAction.setBadgeText({text: getBadgeText(newDollarValue)});

        if (result.showNotifications && newDollarValue !== dollarValue) {
          console.log('dollar rate changed', newDollarValue, dollarValue);
          state['lastUpdated'] = new Date().toISOString();
          new Notification('Dollar Value Changed', <any>{
            type: 'basic',
            icon: dollarValue !== 0 ?
              (newDollarValue > dollarValue ?
                'images/arrow-up.png' :
                'images/arrow-down.png') :
              null,
            body: newDollarValue.toFixed(2),
            tag: new Date().getTime(),
          });
        }

        chrome.storage.sync.set(state, function () {
          console.log('Dollar value is set to ' + value);
        });
        resolve({
          dollarValue,
          selectedCountry,
        });
      })
      .catch((e) => {
        console.error(e);
      });
    });
  });

}

function initApp() {
  console.log('INIT');
  chrome.storage.sync.get(['refreshMinutes', 'country'], function (result: { refreshMinutes: number, country: string }) {
    const refreshMinutes = result.refreshMinutes || 30;
    const selectedCountry: Country = result.country ?
      JSON.parse(result.country) :
      CountryService.DEFAULT_COUNTRY;

    chrome.alarms.create('updateDollar', {
      periodInMinutes: refreshMinutes,
    });

    chrome.alarms.onAlarm.addListener(() => {
      updateDollarValue();
    });

    updateDollarValue();
    setBadgeIcon(selectedCountry);
  });
}

initApp();

// @ts-ignore
chrome.extension.onConnect.addListener(function (port) {
  console.log('Connected .....');
  port.onMessage.addListener(function (msg) {
    if (msg.type === 'getDollarValue') {
      updateDollarValue().then(({dollarValue, selectedCountry}) => {
        port.postMessage({
          type: 'setDollarValue',
          value: dollarValue,
          country: selectedCountry,
        });
      });
    }
  });
});

chrome.storage.onChanged.addListener(function (changes: { country }) {
  // re-init app when country changes
  if (changes.country) {
    chrome.alarms.clearAll(() => {
      initApp();
    });
  }
});
