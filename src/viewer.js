import React, { Component } from 'react';
import { Text, Toolbar, NavLink } from 'rebass'
import Marked from 'marked';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { viewFile, reloadFile } from './actions'


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
    onNewVersion: PropTypes.func.isRequired
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
    return <div>
      <Toolbar className="view-toolbar">
        {this.props.isLoading ? <Text>Loading...</Text> : null }
        {!this.props.isLoading ? <Text>{this.props.name}</Text> : null }
        {!this.props.isLoading ? <NavLink ml='auto' onClick={this.props.onClickEdit}>Edit</NavLink> : null }
      </Toolbar>
      {this.props.text ? <div className="read page" dangerouslySetInnerHTML={{__html: Marked(this.props.text)}} /> : null}
    </div>
  }
}

const mapStateToProps = state => {
  return {
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