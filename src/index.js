import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import Dropbox from 'dropbox';
import QueryString from 'query-string';

// if we came back from dropbox auth, pull it out of the url and clear the hash to setup react-router
const parsedHash = QueryString.parse(window.location.hash);
if (parsedHash['access_token'] !== undefined) {
  for (const key in parsedHash) {
    localStorage.setItem(key, parsedHash[key]);
  }
  document.location.hash = '';
}

// if we don't have a saved dropbox token, redirect you
if (!localStorage.getItem('access_token')) {
  const dbx = new Dropbox({ clientId: '2mbsah2eqyknfxl' });
  const authUrl = dbx.getAuthenticationUrl(window.location.href);
  window.location.href = authUrl;
  //document.write(`<a href="${authUrl}">auth</a>`);
} else {
  // we're good, enter the app
  render(<Router><App /></Router>, document.getElementById('root'));
}

registerServiceWorker();