import * as React from 'react';
import './Popup.scss';
import {Country} from '../model/country';
import {CountryService} from '../services/country.service';

interface AppProps {
}

interface AppState {
  dollarValue: number;
  country: Country;
  lastChecked?: Date;
  lastUpdated?: Date;
}

export default class Popup extends React.Component<AppProps, AppState> {
  state: AppState = {
    dollarValue: 0,
    country: null,
  };

  constructor(props: AppProps) {
    super(props);
  }

  componentDidMount() {
    let self = this;
    // @ts-ignore
    const port = chrome.extension.connect({
      name: 'Sample Communication',
    });

    chrome.storage.sync.get(['dollarValue', 'country', 'lastChecked', 'lastUpdated'],
      function (result: { dollarValue: number, country: string, lastChecked: string, lastUpdated: string }) {
        const dollarValue = result.dollarValue || 0;
        const selectedCountry: Country = result.country ?
          JSON.parse(result.country) :
          CountryService.DEFAULT_COUNTRY;

        self.setState({
          dollarValue: dollarValue,
          country: selectedCountry,
          lastChecked: new Date(result.lastChecked),
          lastUpdated: new Date(result.lastUpdated),
        });
      });

    port.postMessage({type: 'getDollarValue'});

    port.onMessage.addListener(function (msg) {
      if (msg.type === 'setDollarValue') {
        self.setState({
          dollarValue: msg.value,
          country: msg.country,
        });
      }
    });
  }

  getDateStr(date: Date) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  render() {
    const country: Country = this.state.country;
    return (
      <div className={'d-flex align-items-center justify-content-center p-4'}
           style={{minWidth: 300}}>
        {this.state.country ?
          <div className={'text-center'}>
            <div className={'text-muted'}>
              Dollar rate in
              <img src={`https://www.countryflags.io/${country.alpha2Code}/flat/16.png`} style={{margin: '0 10px'}}/>
              {this.state.country.name}</div>
            <h2 className={'m-0'}>{this.state.dollarValue.toFixed(2)}</h2>
            {this.state.lastChecked ?
              <small className={'text-muted'}>
                Last change &nbsp;
                {this.getDateStr(this.state.lastUpdated)}
              </small> :
              ''}
          </div> :
          <div>
            <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"/>
            <span className="sr-only">Loading...</span>
          </div>}
      </div>
    );
  }
}
