import React, { Component } from 'react';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom'
import './App.css';
import { Provider, Flex, Box, Toolbar, NavLink } from 'rebass'

import { createStore, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { Provider as ReduxProvider } from 'react-redux'

import DropboxProvider from './dropboxprovider.js';

import { ConnectedSidebar } from './sidebar.js';
import { ConnectedViewer } from './viewer.js';
import Editor from './editor.js';

import * as Actions from './actions'
import rootReducer from './reducers'

const store = createStore( rootReducer, {}, applyMiddleware(promiseMiddleware()) );
window.store = store; // for debugging

class App extends Component {
  constructor() {
    super();

    this.provider = new DropboxProvider(localStorage['access_token']);

    this.provider.on("update", (updates) => {
      store.dispatch(Actions.updateFileIndex(updates));
    });
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
      <ReduxProvider store={store}>
        <Provider>
          <Router>
            <Flex className="App">
              <Box w={1/6} className="sidebar">
                <Toolbar className="sidebar-toolbar">
                  <NavLink is={Link} to='/new'>+</NavLink>
                </Toolbar> 
                <ConnectedSidebar/>
              </Box>
              <Box w={5/6} className="content">
                <Switch>
                  <Route exact path="/new" render={(props) => {
                    return <Editor history={props.history} provider={this.provider} newFile={true}/>
                  }}/>

                  <Route path="/edit/*" render={(props) => {
                    const path = this.getFilePath(props);
                    const id = store.getState().index.byPath[path];
                    const editFile = store.getState().index.byId[id];
                    const rev = editFile ? editFile.rev : null;

                    return <Editor history={props.history} provider={this.provider} path={path} latestRev={rev}/>
                  }}/>

                  <Route path="/*" render={(props) => {
                    const path = this.getFilePath(props);
                    store.dispatch(Actions.viewFile(path));

                    return <ConnectedViewer onClickEdit={() => { props.history.push("/edit"+path) }}/>
                  }}/>
                </Switch>
              </Box>
            </Flex>
          </Router>
        </Provider>
      </ReduxProvider>
    );
  }
}

export default App;
