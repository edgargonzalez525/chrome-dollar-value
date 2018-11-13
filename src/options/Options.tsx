import * as React from 'react';
import './Options.scss';
import {Country} from '../model/country';
import {CountryService} from '../services/country.service';

interface AppProps {
}

interface AppState {
  refreshMinutes: string;
  selectedCountryId: string;
  countries: Country[];
  loading: boolean;
}

export default class Options extends React.Component<AppProps, AppState> {
  state: AppState = {
    refreshMinutes: '',
    selectedCountryId: '',
    countries: [],
    loading: false,
  };

  constructor(props: AppProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    let self = this;
    CountryService.getCountries()
    .subscribe((countries: Country[]) => {
      chrome.storage.sync.get(['refreshMinutes', 'selectedCountry'], function (result: { refreshMinutes: number, selectedCountry: number }) {
        const refreshMinutes = result.refreshMinutes || 30;
        const selectedCountryId = result.selectedCountry || 1;

        self.setState({
          refreshMinutes: refreshMinutes.toString(),
          selectedCountryId: selectedCountryId.toString(),
          countries: countries,
        });
      });
    });

  }

  onSubmit($event) {
    $event.preventDefault();
    const self = this;
    self.setState({loading: true});
    chrome.storage.sync.set({
      refreshMinutes: parseInt(this.state.refreshMinutes),
      selectedCountry: parseInt(this.state.selectedCountryId),
    }, function () {
      self.setState({loading: false});
    });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-light bg-light">
          <div className={'container'}>
            <a className="navbar-brand" href="#">
              <img src="/images/32_x_32.png"
                   className="d-inline-block align-top" alt=""/>
              <b className={'ml-3'}>DollarPrice</b>
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
                        onChange={($event) => this.setState({selectedCountryId: $event.target.value})}>
                  {this.state.countries.map((country, i) => {
                    return <option key={i} value={country.id}>{country.name}</option>;
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
                       value={this.state.refreshMinutes}
                       onChange={($event) => this.setState({refreshMinutes: $event.target.value || ''})}/>
              </div>
            </div>
            <div className="form-group row">
              <div className="offset-md-4 col-sm-8">
                <button type="submit" className="btn btn-primary"
                        disabled={this.state.loading}>
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
