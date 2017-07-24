import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Flex, Box } from 'rebass';
import Marked from 'marked';
import { Input, Toolbar, NavLink } from 'rebass'
import { connect } from 'react-redux';
import { viewFile, reloadFile, clearFile } from './actions'
import FA from 'react-fontawesome';
import {HotKeys} from 'react-hotkeys';

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
    // FIXME: attach keyboard shortcuts

    this.editDOM = ReactDOM.findDOMNode(this.refs.edit)
    this.previewDOM = ReactDOM.findDOMNode(this.refs.preview)
    if (this.editDOM && this.previewDOM) {
      this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));
    }
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
  
  onTextChange = (event) => {
    this.setState({
      text: event.target.value
    });
  };

  _wrapSelection(ev, tag) {
    ev.preventDefault();

    const ta = ev.target;
    const start = ta.selectionStart;
    let end = ta.selectionEnd;
    if (start !== end && ta.value[end-1] === ' ') {
      end -= 1;
    }

    let str;
    if (start !== end) {
      str = ta.value.substring(0, start) + tag + ta.value.substring(start, end) + tag + ta.value.substring(end);
    } else {
      str = ta.value.substring(0, start) + tag + ta.value.substring(start);
    }

    this.setState({
      text: str
    }, () => {
      ta.selectionStart = ta.selectionEnd = end + tag.length + (start !== end ? tag.length : 0);
    });
  }

  _startOfLine(ev, tag) {
    ev.preventDefault();

    const ta = ev.target;
    let i = ta.selectionStart;
    const carat = ta.selectionStart;
    let str = ta.value;

    while (i > 0) {
      if (ta.value[i] !== '\n') {
        i--;
        continue;
      }

      i++;
      str = ta.value.substring(0, i) + tag + ta.value.substring(i);
      break;
    }

    this.setState({
      text: str
    }, () => {
      ta.selectionStart = ta.selectionEnd = carat + tag.length;
    });
  }

  handlers = {
    'h1': (ev)  => this._startOfLine(ev, "# "),
    'h2': (ev)  => this._startOfLine(ev, "## "),
    'h3': (ev)  => this._startOfLine(ev, "### "),
    'h4': (ev)  => this._startOfLine(ev, "#### "),
    'h5': (ev)  => this._startOfLine(ev, "##### "),
    'h6': (ev)  => this._startOfLine(ev, "###### "),
    'bold': (ev) => this._wrapSelection(ev, "**"),
    'italic': (ev) => this._wrapSelection(ev, "*"),
    'code': (ev) => this._wrapSelection(ev, "`"),
    'strikethrough': (ev) => this._wrapSelection(ev, "~~"),
    'save': (ev) => { ev.preventDefault(); this.props.onClickSave(this.state); }
  }

  keymap = {
    'h1': ['ctrl+1'],
    'h2': ['ctrl+2'],
    'h3': ['ctrl+3'],
    'h4': ['ctrl+4'],
    'h5': ['ctrl+5'],
    'h6': ['ctrl+6'],
    'bold': ['ctrl+b'],
    'italic': ['ctrl+i'],
    'code': ['ctrl+u'],
    'save': ['ctrl+s'],
    'strikethrough': ['ctrl+k']
  }
  
  render() {
    const newerRevision = this.props.latestRev !== this.props.rev;
    return <Flex direction="column">
      <Toolbar className="view-toolbar">
        <FA fixedWidth={true} name="bars" onClick={this.props.onClickMenu}/>
        <FA spin fixedWidth={true} name={this.props.isLoading ? "spinner" : ""}/>
        <Input onChange={this.onNameChange} value={this.state.name} placeholder='Title'/>
        <NavLink onClick={this.props.onClickCancel} ml='auto'>Cancel</NavLink>
        {newerRevision ? <NavLink onClick={() => this.props.onClickReload(this.props.path)}>Reload Latest</NavLink> : null}
        <NavLink onClick={() => this.props.onClickSave(this.state)}>Save</NavLink>
      </Toolbar> 
      {!this.props.isLoading ? <Flex className="editor-area">
        <Box w={6/10}>
          <HotKeys className="hotkeys" keyMap={this.keymap} handlers={this.handlers}>
            <textarea ref="edit" className="page" onChange={this.onTextChange} value={this.state.text}></textarea>
          </HotKeys>
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
    viewFile: path => dispatch(viewFile(path)),
    newFile: path => dispatch(clearFile())
  }
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor)

export {ConnectedEditor, Editor};