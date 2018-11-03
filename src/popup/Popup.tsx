import * as React from 'react';
import './Popup.scss';

interface AppProps {}

interface AppState {}

// @ts-ignore
const port = chrome.extension.connect({
  name: 'Sample Communication',
});

port.postMessage({type: 'getDollarValue'});

port.onMessage.addListener(function (msg) {
  if (msg.type === 'setDollarValue') {

    document.getElementById('dollar-value').innerHTML = msg.value;
  }
});


export default class Popup extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {
        // Example of how to send a message to eventPage.ts.
        chrome.runtime.sendMessage({ popupMounted: true });
    }

    render() {
        return (
            <div className="popupContainer">
                Hello, world!
            </div>
        )
    }
}
