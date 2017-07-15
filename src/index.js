import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import Dropbox from 'dropbox';
import QueryString from 'query-string';

const parsedHash = QueryString.parse(window.location.hash);
if (parsedHash['access_token'] !== undefined) {
  for (const key in parsedHash) {
    localStorage.setItem(key, parsedHash[key]);
  }
}

if (localStorage["access_token"] === undefined) {
  const dbx = new Dropbox({ clientId: '2mbsah2eqyknfxl' });
  const authUrl = dbx.getAuthenticationUrl(window.location.href);
  window.location.href = authUrl;
  //document.write(`<a href="${authUrl}">auth</a>`);
} else {
  window.location.hash = '';
  ReactDOM.render(<App />, document.getElementById('root'));
}

registerServiceWorker();