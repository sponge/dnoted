import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import './App.css';
import DropboxProvider from './dropboxprovider.js';
import IndexBuilder from './indexbuilder.js';
import _ from 'lodash';

import Viewer from './viewer.js';

class App extends Component {
  constructor() {
    super();

    this.provider = new DropboxProvider(localStorage['access_token']);
    this.indexBuilder = new IndexBuilder();

    this.state = {
      index: this.indexBuilder.index,
      byId: this.indexBuilder.byId,
      selected: undefined,
    };

    this.provider.on("update", (updates) => {
      this.indexBuilder.updateIndex(updates);
    });

    this.indexBuilder.on("change", (indexBuilder) => {
      this.setState({
        index: indexBuilder.index,
        byId: indexBuilder.byId
      })
    });
  }

  componentWillUpdate(nextProps, nextState) {

  }

  // return a list of folders and files recursively
  renderIndexNode(node) {
    const inner = (subnode) => {
      const subeles = _.map(subnode.children, inner);
      const files = _.map(Array.from(subnode.files), (id) => {
        const file = this.state.byId.get(id);
        return <li key={file.id} data-id={file.id}>
          <Link to={`/read${file.path_lower}`}>{file.name}</Link>
          </li>;
      });

      return <ul key={subnode.id}>
        <li>
          {subnode.name}
          {subeles}
          <ul>{files}</ul>
        </li>
      </ul>;
    }

    return inner(node);
  }

  render = () => {
    return (
      <Router>
        <div className="App">
          <div className="sidebar">
            {this.renderIndexNode(this.state.index)}
          </div>
          <div className="content">
            <Route path="/read/" render={(props) => {
              console.log(this.provider);
              const path = props.location.pathname.substr(props.match.url.length);
              return <Viewer provider={this.provider} path={path}/>
            }}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
