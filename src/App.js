import React, { Component } from 'react';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom'
import './App.css';
import DropboxProvider from './dropboxprovider.js';
import IndexBuilder from './indexbuilder.js';
import _ from 'lodash';
import { Provider, Flex, Box, Text, Toolbar } from 'rebass'

import Viewer from './viewer.js';
import Editor from './editor.js';

class App extends Component {
  constructor() {
    super();

    this.provider = new DropboxProvider(localStorage['access_token']);
    this.indexBuilder = new IndexBuilder();

    this.state = {
      index: this.indexBuilder.index,
      byId: this.indexBuilder.byId,
      byPath: this.indexBuilder.byPath
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

  getFilePath(props) {
    let path = '/'+ props.match.params[0];
    if (path.endsWith(".md") === false) {
      path += (path.endsWith('/') ? '' : '/') + "index.md";
    }

    return path;
  }

  render = () => {
    return (
      <Provider>
        <Router>
          <Flex className="App">
            <Box w={1/6} className="sidebar">
              <Toolbar className="sidebar-toolbar">
                <Text>sidebar toolbar</Text>
              </Toolbar> 
              {this.renderIndexNode(this.state.index)}
            </Box>
            <Box w={5/6} className="content">
              <Switch>
                <Route exact path="/settings" render={(props) => {
                  return <h1>settings</h1>;
                }}/>

                <Route path="/edit/*" render={(props) => {
                  const path = this.getFilePath(props);
                  const id = this.state.byPath.get(path);
                  const editFile = this.state.byId.get(id);
                  const rev = editFile ? editFile.rev : null;

                  return <Editor provider={this.provider} path={path} latestRev={rev}/>
                }}/>

                <Route path="/*" render={(props) => {
                  const path = this.getFilePath(props);
                  const id = this.state.byPath.get(path);
                  const editFile = this.state.byId.get(id);
                  const rev = editFile ? editFile.rev : null;

                  return <Viewer provider={this.provider} path={path} latestRev={rev}/>
                }}/>
              </Switch>
            </Box>
          </Flex>
        </Router>
      </Provider>   
    );
  }
}

export default App;
