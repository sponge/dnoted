import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
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

  // return a list of folders and files recursively
  renderIndexNode(node) {
    const inner = (subnode) => {
      const subeles = _.map(subnode.children, inner);
      const files = _.map(Array.from(subnode.files), (id) => {
        const file = this.state.byId.get(id);
        return <li key={file.id} data-id={file.id}>
          <Link to={file.path_lower}>{file.name}</Link>
          </li>;
      });

      return <ul key={subnode.id}>
        <li>
          {subnode.indexId ? <Link to={subnode.path_lower}>{subnode.name}</Link> : subnode.name}
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
            <Switch>
              <Route exact path="/settings" render={(props) => {
                return <h1>settings</h1>;
              }}/>

              <Route path="/edit/*" render={(props) => {
                let path = '/'+ props.match.params[0];
                return <h1>editing {path}</h1>;
              }}/>

              <Route path="/*" render={(props) => {
                let path = '/'+ props.match.params[0];
                if (path.endsWith(".md") === false) {
                  path += (path.endsWith('/') ? '' : '/') + "index.md";
                }

                return <Viewer provider={this.provider} path={path}/>
              }}/>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
