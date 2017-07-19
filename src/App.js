import React, { Component } from 'react';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom'
import './App.css';
import DropboxProvider from './dropboxprovider.js';
import IndexBuilder from './indexbuilder.js';
import _ from 'lodash';
import { Provider, Flex, Box, Text, Toolbar, NavLink } from 'rebass'

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
        byId: indexBuilder.byId,
        byPath: this.indexBuilder.byPath
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
          <Link to={file.path_lower}>{file.name.replace('.md','')}</Link>
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
    // FIXME: this is starting to get big and ugly. move them out to separate components
    // FIXME: toolbars not affixing to top of page
    return (
      <Provider>
        <Router>
          <Flex className="App">
            <Box w={1/6} className="sidebar">
              <Toolbar className="sidebar-toolbar">
                <NavLink is={Link} to='/new'>+</NavLink>
              </Toolbar> 
              {this.renderIndexNode(this.state.index)}
            </Box>
            <Box w={5/6} className="content">
              <Switch>
                <Route exact path="/new" render={(props) => {
                  return <Editor history={props.history} provider={this.provider} newFile={true}/>
                }}/>

                <Route path="/edit/*" render={(props) => {
                  const path = this.getFilePath(props);
                  const id = this.state.byPath.get(path);
                  const editFile = this.state.byId.get(id);
                  const rev = editFile ? editFile.rev : null;

                  return <Editor history={props.history} provider={this.provider} path={path} latestRev={rev}/>
                }}/>

                <Route path="/*" render={(props) => {
                  const path = this.getFilePath(props);
                  const id = this.state.byPath.get(path);
                  const editFile = this.state.byId.get(id);
                  const rev = editFile ? editFile.rev : null;

                  return <Viewer history={props.history} provider={this.provider} path={path} latestRev={rev}/>
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
