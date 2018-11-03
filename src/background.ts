import * as numeral from 'numeral';

const refreshMinutes = 30;
let dollarValue = 0;

interface Country {
  code: string;
  url: () => string;
  image: string;
  parseResponse: (response) => Promise<number>;
}

const countries: Country[] = [{
  code: 'CLP',
  url: function () {
    return 'https://www.valor-dolar.cl/currencies_rates.json'
  },
  image: 'chile.png',
  parseResponse: function (response) {
    return new Promise((resolve) => {
      resolve(Number(response.currencies.find((currency) => currency.code === this.code).rate));
    });
  },
}];

let selectedCountry = countries[0];

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
      })
    }
  };
}


function getDollarValue(): Promise<number> {
  //const date = new Date();
  const url = selectedCountry.url();
  const myRequest = new Request(url);

  return fetch(myRequest)
  .then(response => response.json())
  .then(json => selectedCountry.parseResponse(json))

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
    getDollarValue()
    .then((value) => {
      const newDollarValue = value;
      chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 20]});
      chrome.browserAction.setBadgeText({text: getBadgeText(newDollarValue)});
      console.log(newDollarValue, dollarValue, newDollarValue !== dollarValue);
      if (newDollarValue !== dollarValue) {
        new Notification('Dollar Value Changed', {
          body: newDollarValue.toString(),
        });
      }

      dollarValue = newDollarValue;
      resolve(dollarValue);
    })
    .catch((e) => {
      console.error(e)
    });
  });

}

chrome.alarms.create('updateDollar', {
  periodInMinutes: refreshMinutes,
});

chrome.alarms.onAlarm.addListener(() => {
  updateDollarValue();
});

updateDollarValue();
setBadgeIcon(selectedCountry)

// @ts-ignore
chrome.extension.onConnect.addListener(function (port) {
  console.log('Connected .....');
  port.onMessage.addListener(function (msg) {
    if (msg.type === 'getDollarValue') {
      updateDollarValue().then((value) => {
        port.postMessage({
          type: 'setDollarValue',
          value: value,
        });
      });
    }
  });
});
