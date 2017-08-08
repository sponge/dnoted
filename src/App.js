import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Link, Switch } from 'react-router-dom'
import './App.css';
import 'font-awesome/css/font-awesome.css'
import FA from 'react-fontawesome';
import { Provider, Flex, Box, NavLink } from 'rebass'
import { debounce } from 'lodash';

import Remark from 'remark';
import RemarkTaskList from 'remark-task-list';

import { createStore, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { Provider as ReduxProvider } from 'react-redux'

import DropboxProvider from './dropboxprovider.js';

import { ConnectedShareOverlay } from './shareoverlay.js';
import ToolbarView from './toolbarview.js';
import { ConnectedSidebar } from './sidebar.js';
import { Viewer, ConnectedViewer } from './viewer.js';
import { ConnectedEditor } from './editor.js';
import WelcomeMessage from './welcomemessage.js';

import * as Actions from './actions'
import rootReducer from './reducers'

class App extends Component {
  constructor() {
    super();

    this.state = {
      hideNav: false, // show or hide the sidebar tree
      welcomeText: WelcomeMessage // save welcome message so you can use the checkboxes on it
    };

    // try and load a saved toc from localstorage
    let initial = {};
    const storedIndex = JSON.parse(localStorage.getItem('index'));
    if (storedIndex) {
      initial.index = storedIndex;
    }

    this.store = createStore( rootReducer, initial, applyMiddleware(promiseMiddleware()) );
  
    // save index changes
    this.store.subscribe(() => {
      const state = this.store.getState();
      localStorage.setItem('index', JSON.stringify(state.index));
    });

    // setup dropbox with access token and latest index cursor
    this.provider = new DropboxProvider(localStorage.getItem('access_token'), storedIndex ? localStorage.getItem('cursor') : null);
    this.provider.on("update", (updates) => {
      // update the index and send updates to redux store
      this.store.dispatch(Actions.updateFileIndex(updates));
      localStorage.setItem('cursor', this.provider.cursor);
    });

    // for debugging
    window.dbgstore = this.store; 
    window.dbgdbx = this.provider; 
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  // add a / to beginning of router path and append .index.md if its a folder
  getFilePath(props) {
    let path = '/'+ props.match.params[0];
    if (path.endsWith(".md") === false) {
      path += (path.endsWith('/') ? '' : '/') + "index.md";
    }

    return path;
  }

  // viewer callback, call debounced function
  saveTaskList = () => {
    const st = this.store.getState();
    this.debouncedSaveTaskList(st.viewer.path, st.viewer.text);
  }

  // similar to savefile but without checks or post-save actions
  debouncedSaveTaskList = debounce((path, text) => {
    this.store.dispatch(Actions.startLoading());
    this.provider.setTextContents(path, text).then(() => {
      this.store.dispatch(Actions.stopLoading());
    }).catch((error) => {
      // FIXME: error handling
      console.log(error);
      this.store.dispatch(Actions.stopLoading());
    });    
  }, 5000)

  // editor requested save file
  saveFile = (file) => {
    const history = this.context.router.history;

    // validation
    if (!file.name || !file.name.length) {
      alert('Please specify a filename before saving.');
      return;
    }

    // enable loading indicator
    this.store.dispatch(Actions.startLoading());

    // dummy promise as a starting point in case user isn't renaming
    let move = new Promise((a) => a())
    let renamed = false;

    // prepend / and append .md to get valid path if user doesn't enter them
    let savePath = file.name.endsWith('.md') ? file.name : file.name+'.md';
    savePath = savePath.startsWith('/') ? savePath : '/'+savePath;

    // new files are always renamed so history updates right
    if (!file.path) {
      renamed = true;
    // check if filename moved, init the promise chain with move instead of save
    } else if (file.path !== savePath) {
      move = this.provider.movePath(file.path, savePath);
      renamed = true;
    }

    move.then(() => {
      return this.provider.setTextContents(savePath, file.text);
    }).then(() => {
      // update the url if they've renamed it
      if (renamed) {
        history.replace('/edit'+savePath);
      }

      // jump to the viewer page and end loading
      history.push(savePath);
      this.store.dispatch(Actions.stopLoading());
    }).catch((error) => {
      // FIXME: error handling
      console.log(error);
      this.store.dispatch(Actions.stopLoading());
    });
  }

  // hamburger menu clicked on from editor/viewer
  onClickMenu = () => {
    this.setState({hideNav: !this.state.hideNav});
  }

  // delete button clicked on from inside editor
  onClickDelete = (path) => {
    const history = this.context.router.history;
    const res = window.confirm(`Are you sure you want to delete ${path}?`);

    if (!res) {
      return;
    }
    
    this.provider.deleteFile(path).then((response) => {
      history.push('/');
    })
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
                    return <ConnectedEditor onClickMenu={this.onClickMenu} onClickDelete={this.onClickDelete} path={path} onClickCancel={() => props.history.push(path)} onClickSave={this.saveFile}/>
                  }}/>

                  <Route path="/help!" render={(props) => {
                    const onChecked = (id) => {
                      const newText = Remark().use(RemarkTaskList, {toggle: [id]}).processSync(this.state.welcomeText).contents;
                      this.setState({welcomeText: newText});
                    }

                    return <Viewer onChecked={onChecked} onClickMenu={this.onClickMenu} text={this.state.welcomeText}/>
                  }}/>

                  <Route path="/*" render={(props) => {
                    const path = this.getFilePath(props);
                    return <ConnectedViewer onClickMenu={this.onClickMenu} path={path} onTaskListChecked={this.saveTaskList} onClickEdit={() => props.history.push("/edit"+path)}/>
                  }}/>
                </Switch>
              </Box>
            </Flex>
            <ConnectedShareOverlay/>
        </Provider>
      </ReduxProvider>
    );
  }
}

export default App;
