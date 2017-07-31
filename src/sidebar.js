import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import FA from 'react-fontawesome';
import { toggleFolderVisibility } from './actions';

class Sidebar extends Component {
  static propTypes = {
    index: PropTypes.object.isRequired,
    onNodeClick: PropTypes.func.isRequired,
    onFolderClick: PropTypes.func.isRequired
  }

  onNodeClick = (ev) => {
    this.props.onNodeClick(ev.target.getAttribute('data-link'));
    return false;
  }

  onFolderClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const path = ev.currentTarget.getAttribute('data-folder')
    this.props.onFolderClick(path);
    return false;
  }

// return a list of folders and files recursively
  renderIndexNode = (subnodeId) => {
    const subnode = this.props.index.byId[subnodeId];
    let subeles = [];
    let files = [];

    if (subnode.expanded) {
      subeles = _.map(subnode.children, this.renderIndexNode);
      files = _.map(subnode.files, (id) => {
        const file = this.props.index.byId[id];
        return <li key={file.id} data-id={file.id}>
          <span onClick={this.onNodeClick} data-link={file.path_lower}>
            <FA fixedWidth={true} name="file-text"/>
            {file.name.replace('.md','')}
          </span>
        </li>;
      });
    }

    return <ul key={subnode.id}>
      <li>
        {subnode.indexId ?
          <span onClick={this.onNodeClick} data-link={subnode.path_lower}>
            <span data-folder={subnode.path_lower} onClick={this.onFolderClick}>
              <FA className="folder" fixedWidth={true} name={subnode.expanded ? "folder-open" : "folder"}/>
            </span>
            {subnode.name}
          </span>
        : 
          <span className="disabled">
            <span data-folder={subnode.path_lower} onClick={this.onFolderClick}>
              <FA className="folder" fixedWidth={true} name={subnode.expanded ? "folder-open-o" : "folder-o"}/>
            </span>
            {subnode.name}
          </span>
        }
        {subeles}
        <ul>{files}</ul>
      </li>
    </ul>;
  }

  render() {
    return this.renderIndexNode('root')
  }
}

const mapStateToProps = state => {
  return {
    index: state.index
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFolderClick: path => dispatch(toggleFolderVisibility(path))
  }
}

const ConnectedSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar)

export {ConnectedSidebar, Sidebar};