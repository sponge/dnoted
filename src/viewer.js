import React, { Component } from 'react';
import { Text, Toolbar, NavLink } from 'rebass'
import Marked from 'marked';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Viewer extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    text: PropTypes.string,
    isLoading: PropTypes.bool,
    onClickEdit: PropTypes.func.isRequired
  }

  render() {
    return <div>
      <Toolbar className="view-toolbar">
        {!this.props.isLoading ? <Text>{this.props.name}</Text> : null }
        {!this.props.isLoading ? <NavLink ml='auto' onClick={this.props.onClickEdit}>Edit</NavLink> : null }
      </Toolbar>
      {!this.props.isLoading ? <div className="read page" dangerouslySetInnerHTML={{__html: Marked(this.props.text)}} /> : null}
    </div>
  }
}

const mapStateToProps = state => {
  return {
    isLoading: state.viewer.isLoading,
    name: state.viewer.name,
    path: state.viewer.path,
    text: state.viewer.text
  }
}

const mapDispatchToProps = dispatch => {
  return {
    // onTodoClick: id => {
    //   dispatch(toggleTodo(id))
    // }
  }
}

const ConnectedViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Viewer)

export {ConnectedViewer, Viewer};