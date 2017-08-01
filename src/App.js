import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Link, Switch } from 'react-router-dom'
import './App.css';
import 'font-awesome/css/font-awesome.css'
import FA from 'react-fontawesome';
import { Provider, Flex, Box, NavLink } from 'rebass'

import { createStore, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { Provider as ReduxProvider } from 'react-redux'

import DropboxProvider from './dropboxprovider.js';

import ToolbarView from './toolbarview.js';
import { ConnectedSidebar } from './sidebar.js';
import { ConnectedViewer } from './viewer.js';
import { ConnectedEditor } from './editor.js';

import * as Actions from './actions'
import rootReducer from './reducers'

class App extends Component {
  constructor() {
    super();

    this.state = {
      hideNav: false
    };

    let initial = {};
    const storedIndex = JSON.parse(localStorage.getItem('index'));
    if (storedIndex) {
      initial.index = storedIndex;
    }

    this.store = createStore( rootReducer, initial, applyMiddleware(promiseMiddleware()) );
    window.dbgstore = this.store; // for debugging

    // save index changes to disk
    this.store.subscribe(() => {
      const state = this.store.getState();
      localStorage.setItem('index', JSON.stringify(state.index));
    });

    this.provider = new DropboxProvider(localStorage.getItem('access_token'), storedIndex ? localStorage.getItem('cursor') : null);
    this.provider.on("update", (updates) => {
      this.store.dispatch(Actions.updateFileIndex(updates));
      localStorage.setItem('cursor', this.provider.cursor);
    });
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  getFilePath(props) {
    let path = '/'+ props.match.params[0];
    if (path.endsWith(".md") === false) {
      path += (path.endsWith('/') ? '' : '/') + "index.md";
    }

    return path;
  }

  saveFile = (file) => {
    const history = this.context.router.history;

    if (!file.name || !file.name.length) {
      alert('Please specify a filename before saving.');
      return;
    }

    this.store.dispatch(Actions.startLoading());

    let move = new Promise((a) => a())
    let renamed = false;

    let savePath = file.name.endsWith('.md') ? file.name : file.name+'.md';
    savePath = savePath.startsWith('/') ? savePath : '/'+savePath;
    
    if (file.path !== savePath) {
      move = this.provider.movePath(file.path, savePath);
      renamed = true;
    }

    move.then(() => {
      return this.provider.setTextContents(savePath, file.text);
    }).then(() => {
      if (renamed) {
        history.replace('/edit'+savePath);
      }

      history.push(savePath);
    }).catch((error) => {
      // FIXME: error handling
      console.log(error);
      this.store.dispatch(Actions.stopLoading());
    });
  }

  onClickMenu = () => {
    this.setState({hideNav: !this.state.hideNav});
  }

  render = () => {
    return (
      <ReduxProvider store={this.store}>
        <Provider>
            <Flex className="App">
              <Box w={(this.state.hideNav ? 0:1)/6} className="sidebar">
                <ToolbarView toolbar={<div><NavLink is={Link} to='/new'><FA name="plus-circle"/></NavLink></div>}>
                  <ConnectedSidebar onNodeClick={(path) => this.context.router.history.push(path)}/>
                </ToolbarView>
              </Box>
              <Box w={(this.state.hideNav ? 6:5)/6} className="content">
                <Switch>
                  <Route exact path="/new" render={(props) => {
                    return <ConnectedEditor onClickMenu={this.onClickMenu} onClickCancel={() => props.history.go(-1)} onClickSave={this.saveFile}/>
                  }}/>

                  <Route path="/edit/*" render={(props) => {
                    const path = this.getFilePath(props);
                    return <ConnectedEditor onClickMenu={this.onClickMenu} path={path} onClickCancel={() => props.history.push(path)} onClickSave={this.saveFile}/>
                  }}/>

                  <Route path="/*" render={(props) => {
                    const path = this.getFilePath(props);
                    return <ConnectedViewer onClickMenu={this.onClickMenu} path={path} onClickEdit={() => props.history.push("/edit"+path)}/>
                  }}/>
                </Switch>
              </Box>
            </Flex>
        </Provider>
      </ReduxProvider>
    );
  }
}

export default App;
