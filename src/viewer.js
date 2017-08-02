import React, { Component } from 'react';
import { Text, NavLink } from 'rebass'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { viewFile, reloadFile } from './actions'
import FA from 'react-fontawesome';
import ToolbarView from './toolbarview.js';
import Markdown from './markdownviewer.js';


class Viewer extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    text: PropTypes.string,
    rev: PropTypes.string,
    latestRev: PropTypes.string,
    isLoading: PropTypes.bool,
    viewFile: PropTypes.func.isRequired,
    onClickEdit: PropTypes.func.isRequired,
    onNewVersion: PropTypes.func.isRequired,
    onClickMenu: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  componentWillMount() {
    this.props.viewFile(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.props.viewFile(nextProps.path);
    }

    if (nextProps.latestRev !== nextProps.rev) {
      this.props.onNewVersion(nextProps.path);
    }
  }

  render() {
    const toolbar = <span>
      <NavLink className="toaster" onClick={this.props.onClickMenu}><FA name="bars"/></NavLink>
      <FA spin fixedWidth={true} name={this.props.isLoading ? "spinner" : ""}/>
      {!this.props.isLoading ? <Text> {this.props.name}</Text> : null }
      {!this.props.isLoading && !this.props.error ? <NavLink ml='auto' onClick={this.props.onClickEdit}>Edit</NavLink> : null }
    </span>

    return <ToolbarView toolbar={toolbar}>
      {this.props.text ? <div className="read page"><Markdown className="read page" text={this.props.text}/></div> : null}
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
    onNewVersion: path => dispatch(reloadFile(path)),
    viewFile: path => dispatch(viewFile(path))
  }
}

const ConnectedViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Viewer)

export {ConnectedViewer, Viewer};