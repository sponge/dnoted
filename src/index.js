import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
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
  document.location.hash = '';
}

if (localStorage["access_token"] === undefined) {
  const dbx = new Dropbox({ clientId: '2mbsah2eqyknfxl' });
  const authUrl = dbx.getAuthenticationUrl(window.location.href);
  window.location.href = authUrl;
  //document.write(`<a href="${authUrl}">auth</a>`);
} else {
  ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));
}

registerServiceWorker();