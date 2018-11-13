import * as numeral from 'numeral';
import {Country} from './model/country';
import {CountryService} from './services/country.service';

function setBadgeIcon(country: Country) {
  const c: HTMLCanvasElement = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const imageObj1 = new Image();
  const imageObj2 = new Image();
  imageObj1.src = `images/flags/${country.image}`;
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
  //const date = new Date();
  const url = country.url();
  const myRequest = new Request(url);

  return fetch(myRequest)
  .then(response => response.json())
  .then(json => country.parseResponse(json));

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
    CountryService.getCountries()
    .subscribe((countries: Country[]) => {
      chrome.storage.sync.get(['dollarValue', 'selectedCountry'], function (result: { dollarValue: number, selectedCountry: number }) {
        const dollarValue = result.dollarValue || 0;
        const selectedCountryId = result.selectedCountry || 1;
        const selectedCountry: Country = countries.find((item) => item.id === selectedCountryId);

        getDollarValue(selectedCountry)
        .then((value) => {
          const newDollarValue = value;
          chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 20]});
          chrome.browserAction.setBadgeText({text: getBadgeText(newDollarValue)});

          if (newDollarValue !== dollarValue) {
            new Notification('Dollar Value Changed', <any>{
              type: 'image',
              icon: dollarValue !== 0 ?
                (newDollarValue > dollarValue ?
                  'images/arrow-up.png' :
                  'images/arrow-down.png') :
                null,
              body: newDollarValue.toString(),
            });
          }

          chrome.storage.sync.set({dollarValue: newDollarValue}, function () {
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

  });

}

function initApp() {
  console.log('INIT');
  chrome.storage.sync.get(['refreshMinutes', 'selectedCountry'], function (result: { refreshMinutes: number, selectedCountry: number }) {
    CountryService.getCountries()
    .subscribe((countries: Country[]) => {
      const refreshMinutes = result.refreshMinutes || 30;
      const selectedCountryId = result.selectedCountry || 1;
      const selectedCountry: Country = countries.find((item) => item.id === selectedCountryId);

      chrome.alarms.create('updateDollar', {
        periodInMinutes: refreshMinutes,
      });

      chrome.alarms.onAlarm.addListener(() => {
        updateDollarValue();
      });

      updateDollarValue();
      setBadgeIcon(selectedCountry);
    });

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

chrome.storage.onChanged.addListener(function (changes) {
  // do not re init app when saving dollar value
  if (changes.dollarValue === undefined) {
    chrome.alarms.clearAll(() => {
      initApp();
    });
  }
});
