import * as React from 'react';
import './Popup.scss';
import {Country} from '../model/country';

interface AppProps {
}

interface AppState {
  dollarValue: number,
  country: Country
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

    port.postMessage({type: 'getDollarValue'});

    port.onMessage.addListener(function (msg) {
      if (msg.type === 'setDollarValue') {
        self.setState({
          dollarValue: msg.value,
          country: msg.country,
        })
      }
    });
  }

  render() {
    return (
      <div className={'d-flex align-items-center justify-content-center p-4'}
           style={{minWidth: 300}}>
        {this.state.country ?
          <div className={'text-center'}>
            <div className={'text-muted'}>Precio del dolar en {this.state.country.name}</div>
            <h2>{this.state.dollarValue}</h2>
          </div> :
          <div>
            <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"/>
            <span className="sr-only">Loading...</span>
          </div>}
      </div>
    )
  }
}
