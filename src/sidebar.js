import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import FA from 'react-fontawesome';

class Sidebar extends Component {
  static propTypes = {
    tree: PropTypes.object.isRequired,
    byId: PropTypes.object.isRequired,
    onNodeClick: PropTypes.func.isRequired
  }

  onNodeClick = (ev) => {
    this.props.onNodeClick(ev.target.getAttribute('data-link'));
  }

// return a list of folders and files recursively
  renderIndexNode = (subnode) => {
    const subeles = _.map(subnode.children, this.renderIndexNode);
    const files = _.map(subnode.files, (id) => {
      const file = this.props.byId[id];
      return <li key={file.id} data-id={file.id}>
        <span onClick={this.onNodeClick} data-link={file.path_lower}><FA name="file-text"/> {file.name.replace('.md','')}</span>
        </li>;
    });

    return <ul key={subnode.id}>
      <li>
        {subnode.indexId ? <span onClick={this.onNodeClick} data-link={subnode.path_lower}><FA name="folder"/> {subnode.name}</span> : <span className="disabled"><FA name="folder-o"/> {subnode.name}</span>}
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