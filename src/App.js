import React, { Component } from 'react';
import './App.css';
import dbx from './dbx.js';
import ChangeTracker from './changetracker.js';

class App extends Component {
  componentDidMount() {
    this.tracker = new ChangeTracker(localStorage['access_token']);

    dbx.filesDownload({path: '/index.md'})
      .then((response) => {
        const blob = response.fileBlob;
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            console.log(reader.result); // will print out file content
        });
        reader.readAsText(blob);
      })
      .catch((error) => {
          console.error(error);
      })
  }

  render() {
    return (
      <div className="App">
        dropbox!
      </div>
    );
  }
}

export default App;
