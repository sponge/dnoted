import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

class Sidebar extends Component {
  static propTypes = {
    tree: PropTypes.object.isRequired,
    byId: PropTypes.object.isRequired,
  }

// return a list of folders and files recursively
  renderIndexNode = (subnode) => {
    const subeles = _.map(subnode.children, this.renderIndexNode);
    const files = _.map(subnode.files, (id) => {
      const file = this.props.byId[id];
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

  render() {
    return this.renderIndexNode(this.props.tree)
  }
}

const mapStateToProps = state => {
  return {
    // FIXME: why does this make it work? probably an issue of mutating tree and not making a new one
    index: state.index, 
    tree: state.index.tree,
    byId: state.index.byId
  }
}

const ConnectedSidebar = connect(
  mapStateToProps,
  undefined
)(Sidebar)

export {ConnectedSidebar, Sidebar};