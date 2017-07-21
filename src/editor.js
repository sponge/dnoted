import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Flex, Box } from 'rebass';
import Marked from 'marked';
import { Input, Toolbar, NavLink } from 'rebass'
import { connect } from 'react-redux';
import { viewFile, reloadFile } from './actions'

class Editor extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    text: PropTypes.string,
    rev: PropTypes.string,
    latestRev: PropTypes.string,
    isLoading: PropTypes.bool,
    viewFile: PropTypes.func.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickReload: PropTypes.func.isRequired,
    onClickSave: PropTypes.func.isRequired
  }
  
  constructor() {
    super();
    
    this.state = {
      path: null,
      rev: null,
      name: '',
      text: ''
    }
  }
  
  componentDidMount() {
    // FIXME: attach keyboard shortcuts

    this.editDOM = ReactDOM.findDOMNode(this.refs.edit)
    this.previewDOM = ReactDOM.findDOMNode(this.refs.preview)
    if (this.editDOM && this.previewDOM) {
      this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));
    }
  }

  componentWillMount() {
    this.props.viewFile(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.props.viewFile(nextProps.path);
    }

    if (nextProps.rev !== this.state.rev) {
      this.setState({
        path: nextProps.path,
        name: nextProps.name,
        text: nextProps.text,
        rev: nextProps.rev
      })
    }
  }

  _handleScroll = (ev) => {
    const scrollEle = ev.srcElement;
    const otherEle = ev.srcElement === this.editDOM ? this.previewDOM : this.editDOM;
    const pct = scrollEle.scrollTop / (scrollEle.scrollHeight - scrollEle.clientHeight);
    otherEle.scrollTop = (otherEle.scrollHeight - otherEle.clientHeight) * pct;
  }

  onNameChange = (event) => {
    this.setState({
      name: event.target.value
    })
  }
  
  onTextChange = (event) => {
    this.setState({
      text: event.target.value
    });
  };
  
  render() {
    const newerRevision = this.props.latestRev !== this.props.rev;
    return <Flex direction="column">
      <Toolbar className="view-toolbar">
        <Input onChange={this.onNameChange} value={this.state.name} placeholder='Title'/>
        <NavLink onClick={this.props.onClickCancel} ml='auto'>Cancel</NavLink>
        {newerRevision ? <NavLink onClick={() => this.props.onClickReload(this.props.path)}>Reload Latest</NavLink> : null}
        <NavLink onClick={() => this.props.onClickSave(this.state)}>Save</NavLink>
      </Toolbar> 
      {this.state.text ? <Flex className="editor-area">
        <Box w={6/10}>
          <textarea ref="edit" className="page" onChange={this.onTextChange} value={this.state.text}></textarea>
        </Box>
        <Box w={4/10}>
          <div ref="preview" className="page preview" dangerouslySetInnerHTML={{__html: Marked(this.state.text)}}></div>
        </Box>
      </Flex> : null}
    </Flex>
  }
}

const mapStateToProps = state => {
  return {
    name: state.viewer.name,
    text: state.viewer.text,
    rev: state.viewer.rev,
    latestRev: state.viewer.latestRev,
    isLoading: state.viewer.isLoading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickReload: path => dispatch(reloadFile(path)),
    viewFile: path => dispatch(viewFile(path))
  }
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor)

export {ConnectedEditor, Editor};