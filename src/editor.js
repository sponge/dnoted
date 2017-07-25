import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Flex, Box } from 'rebass';
import Marked from 'marked';
import { Input, Toolbar, NavLink } from 'rebass'
import { connect } from 'react-redux';
import { viewFile, reloadFile, clearFile } from './actions'
import FA from 'react-fontawesome';
import ToolbarView from './toolbarview.js';

import CodeMirror from 'react-codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/railscasts.css';

class Editor extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    text: PropTypes.string,
    rev: PropTypes.string,
    latestRev: PropTypes.string,
    isLoading: PropTypes.bool,
    newFile: PropTypes.func.isRequired,
    viewFile: PropTypes.func.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onClickReload: PropTypes.func.isRequired,
    onClickSave: PropTypes.func.isRequired,
    onClickMenu: PropTypes.func.isRequired
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
    this.editDOM = ReactDOM.findDOMNode(this.refs.editBox)
    this.previewDOM = ReactDOM.findDOMNode(this.refs.previewBox)
    this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));
  }

  componentWillMount() {
    if (this.props.path) {
      this.props.viewFile(this.props.path);
    } else {
      this.props.newFile();
    }
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
  
  onTextChange = (text) => {
    this.setState({
      text: text
    });
  };

  
  render() {
		const options = {
      lineNumbers: false,
      mode: 'markdown',
      theme: 'railscasts',
      viewportMargin: Infinity
		};
    const newerRevision = this.props.latestRev !== this.props.rev;

    const toolbar = <span>
      <FA fixedWidth={true} name="bars" onClick={this.props.onClickMenu}/>
      <FA spin fixedWidth={true} name={this.props.isLoading ? "spinner" : ""}/>
      <Input onChange={this.onNameChange} value={this.state.name} placeholder='Title'/>
      <NavLink onClick={this.props.onClickCancel} ml='auto'>Cancel</NavLink>
      {newerRevision ? <NavLink onClick={() => this.props.onClickReload(this.props.path)}>Reload Latest</NavLink> : null}
      <NavLink onClick={() => this.props.onClickSave(this.state)}>Save</NavLink>
    </span>

    return <ToolbarView toolbar={toolbar}>
      <Box w={6/10} ref="editBox" style={{overflowY: 'scroll'}}>
        {!this.props.isLoading ? <CodeMirror className="page" onChange={this.onTextChange} value={this.state.text} options={options}/> : null }
      </Box>
      <Box w={4/10} ref="previewBox" style={{overflowY: 'hidden'}}>
        {!this.props.isLoading ? <div className="page preview" dangerouslySetInnerHTML={{__html: Marked(this.state.text)}}></div> : null }
      </Box>
    </ToolbarView>
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
    viewFile: path => dispatch(viewFile(path)),
    newFile: path => dispatch(clearFile())
  }
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor)

export {ConnectedEditor, Editor};