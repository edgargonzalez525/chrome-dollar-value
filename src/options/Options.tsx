import './Options.scss';

import * as React from 'react';

import { Country } from '../model/country';
import { CountryService } from '../services/country.service';

interface AppProps {
}

interface AppState {
  refreshMinutes: string;
  country: Country;
  countries: Country[];
  loading: boolean;
  showNotifications: boolean;
}

interface IResultChromeStorage {
  refreshMinutes: number;
  country: string;
  showNotifications: boolean;
}

export default class Options extends React.Component<AppProps, AppState> {
  state: AppState = {
    refreshMinutes: '',
    country: null,
    countries: [],
    loading: false,
    showNotifications: true
  };

  constructor(props: AppProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    CountryService.getCountries()
    .subscribe((countries: Country[]) => {
      chrome.storage.sync.get(['refreshMinutes', 'country', 'showNotifications'], ({ refreshMinutes = 30, country, showNotifications = true }: IResultChromeStorage) => {
        const selectedCountry: Country = country ?
          JSON.parse(country) :
          CountryService.DEFAULT_COUNTRY;

        this.setState({
          refreshMinutes: refreshMinutes.toString(),
          country: selectedCountry,
          countries: countries,
          showNotifications
        });
      });
    });

  }

  onSubmit($event) {
    $event.preventDefault();
    this.setState({ loading: true });

    const { refreshMinutes, country, showNotifications } = this.state;
    chrome.storage.sync.set({
      refreshMinutes: parseInt(refreshMinutes, 10),
      country: JSON.stringify(country),
      showNotifications
    }, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { country, countries, refreshMinutes, showNotifications, loading } = this.state;
    return (
      <div>
        <nav className="navbar navbar-light bg-light">
          <div className={'container'}>
            <a className="navbar-brand" href="#">
              <img src="/images/32_x_32.png"
                   className="d-inline-block align-top" alt=""/>
              <b className={'ml-3'}>Dollar Exchange Rate</b>
            </a>
          </div>
        </nav>
        <div className={'container'}>
          <h3 className={'mb-3 mt-4'}>General Options</h3>
          <form onSubmit={this.onSubmit}>
            <div className="form-group row">
              <label htmlFor="inputState" className="col-sm-4 col-form-label">
                Country
              </label>
              <div className="col-sm-8">
                <select id="inputState" className="form-control"
                        value={country ? country.alpha2Code : ''}
                        onChange={($event) => {
                          const alphaCode = $event.target.value;
                          this.setState((state) => {
                            return {
                              country: state.countries.find(item => item.alpha2Code === alphaCode),
                            };
                          });
                        }}>
                  {countries.map((country, i) => {
                    return <option key={i} value={country.alpha2Code}>{country.name}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="refreshTime" className="col-sm-4 col-form-label">
                Refresh dollar value in minutes
              </label>
              <div className="col-sm-8">
                <input type="number" className="form-control" id="inputEmail3"
                       required={true}
                       value={refreshMinutes}
                       onChange={($event) => this.setState({refreshMinutes: $event.target.value || ''})}/>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="showNotifications" className="col-sm-4 col-form-label">
                Show notifications for rate change
              </label>
              <div className="col-sm-8">
                <select id="showNotifications" className="form-control"
                        value={showNotifications ? 'true' : ''}
                        onChange={($event) => this.setState({ showNotifications: Boolean($event.target.value) })}>
                  <option value={'true'}>Yes</option>
                  <option value={''}>No</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <div className="offset-md-4 col-sm-8">
                <button type="submit" className="btn btn-primary"
                        disabled={loading}>
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
