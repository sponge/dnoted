import React, { Component } from 'react';
import { Text, NavLink } from 'rebass'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { viewFile, reloadFile, toggleTaskListItem, shareFile } from './actions'
import FA from 'react-fontawesome';
import ToolbarView from './toolbarview.js';
import Markdown from './markdownviewer.js';


class Viewer extends Component {
  static propTypes = {
    name: PropTypes.string, // name of the file, just path for now
    path: PropTypes.string, // path to the file
    text: PropTypes.string, // contents of the file
    rev: PropTypes.string, // revision of the file we are actually viewing
    latestRev: PropTypes.string, // latest revision of file, will trigger reload automatically
    isLoading: PropTypes.bool, // show loading indicator, disable some ui
    viewFile: PropTypes.func, // redux callback to initiate file download
    onClickEdit: PropTypes.func, // callback when user clicks edit
    onNewVersion: PropTypes.func, // redux callback when we know a new version of the file exists
    onClickMenu: PropTypes.func.isRequired, // callback when user clicks hamburger menu
    onClickShare: PropTypes.func,
    onChecked: PropTypes.func.isRequired, // redux callback to change the checkbox
    onTaskListChecked: PropTypes.func // callback when tasklist changes, usually just for saving the file
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  // trigger redux action for file download
  componentWillMount() {
    if (this.props.viewFile && this.props.path) {
      this.props.viewFile(this.props.path);
    }
  }

  componentWillReceiveProps(nextProps) {
    // we changed files, update
    if (nextProps.path !== this.props.path) {
      this.props.viewFile(nextProps.path);
    }

    // we have a new version, trigger callback. redux will reload file
    if (this.props.onNewVersion && nextProps.latestRev !== nextProps.rev) {
      this.props.onNewVersion(nextProps.path);
    }

    // we don't have a root index.md, forward them to the help
    if (nextProps.error === true && nextProps.path === '/index.md') {
      this.context.router.history.replace('help!');
    }
  }

  onChecked = (id) => {
    // tell redux to update the store, and then trigger the callback that the markdown body has changed
    this.props.onChecked(id);
    if (this.props.onTaskListChecked) {
      this.props.onTaskListChecked();
    }
  }

  render() {
    const toolbar = <span>
      <NavLink className="toaster" onClick={this.props.onClickMenu}><FA name="bars"/></NavLink>
      <FA spin fixedWidth={true} name={this.props.isLoading ? "spinner" : ""}/>
      {!this.props.isLoading ? <Text> {this.props.name}</Text> : null }
      <Text ml='auto'/>
      {this.props.onClickShare && !this.props.isLoading && !this.props.error ? <NavLink onClick={() => this.props.onClickShare(this.props.path)}>Share</NavLink> : null }
      {this.props.onClickEdit && !this.props.isLoading && !this.props.error ? <NavLink onClick={this.props.onClickEdit}>Edit</NavLink> : null }
    </span>

    return <ToolbarView toolbar={toolbar}>
      {this.props.text ? <div className="read page"><Markdown text={this.props.text} onChecked={this.onChecked}/></div> : null}
    </ToolbarView>
  }
}

const mapStateToProps = state => {
  return {
    error: state.viewer.error,
    isLoading: state.viewer.isLoading,
    name: state.viewer.name,
    text: state.viewer.text,
    rev: state.viewer.rev,
    latestRev: state.viewer.latestRev
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChecked: id => dispatch(toggleTaskListItem(id)),
    onNewVersion: path => dispatch(reloadFile(path)),
    viewFile: path => dispatch(viewFile(path)),
    onClickShare: path => dispatch(shareFile(path))
  }
}

const ConnectedViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Viewer)

export {ConnectedViewer, Viewer};