import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Prompt } from 'react-router-dom'
import { Box } from 'rebass';
import { Input, NavLink } from 'rebass'
import { connect } from 'react-redux';
import { viewFile, reloadFile, clearFile } from './actions'
import FA from 'react-fontawesome';
import ToolbarView from './toolbarview.js';
import Markdown from './markdownviewer.js';
import Remark from 'remark';
import RemarkTaskList from 'remark-task-list';

import CodeMirror from 'react-codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/railscasts.css';

class Editor extends Component {
  static propTypes = {
    name: PropTypes.string, // user-editable name of the file
    path: PropTypes.string, // original path of file
    text: PropTypes.string, // file contents
    rev: PropTypes.string, // revision from provider
    latestRev: PropTypes.string, // latest revision from provider to check if new version
    isLoading: PropTypes.bool, // show loading indicator and disable some ui
    newFile: PropTypes.func.isRequired, // clear current file in redux store
    viewFile: PropTypes.func.isRequired, // request file from provider
    onClickCancel: PropTypes.func.isRequired, // user clicked cancel
    onClickDelete: PropTypes.func, // user clicked delete
    onClickReload: PropTypes.func.isRequired, // user clicked reload file when active
    onClickSave: PropTypes.func.isRequired, // user clicked save
    onClickMenu: PropTypes.func.isRequired // user clicked hamburger menu
  }
  
  constructor() {
    super();
    
    // we need to copy some state internally since we don't hand to handle redux actions
    // for every keypress.
    this.state = {
      path: null,
      rev: null,
      name: '',
      text: '',
      disableQuitPrompt: false // don't show "wanna leave?" message when navigating away
    }
  }
  
  componentDidMount() {
    // sync up the preview scrolling with the editor scrolling
    this.editDOM = findDOMNode(this.refs.editBox)
    this.previewDOM = findDOMNode(this.refs.previewBox)
    this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));
  }

  componentWillMount() {
    // determine if we need a new file or to clear any old file
    if (this.props.path) {
      this.props.viewFile(this.props.path);
    } else {
      this.props.newFile();
    }
  }

  componentWillReceiveProps(nextProps) {
    // request a new file
    if (nextProps.path !== this.props.path) {
      this.props.viewFile(nextProps.path);
    }

    // we got a new file, set the contents
    if (nextProps.rev !== this.state.rev) {
      this.setState({
        path: nextProps.path,
        name: nextProps.name,
        text: nextProps.text,
        rev: nextProps.rev
      })
    }
  }

  // try and sync up the code scrollbar to the mirror scrollbar, basic implementation
  _handleScroll = (ev) => {
    const scrollEle = ev.srcElement;
    const otherEle = ev.srcElement === this.editDOM ? this.previewDOM : this.editDOM;
    const pct = scrollEle.scrollTop / (scrollEle.scrollHeight - scrollEle.clientHeight);
    otherEle.scrollTop = (otherEle.scrollHeight - otherEle.clientHeight) * pct;
  }

  // user changed the title field
  onNameChange = (event) => {
    this.setState({
      name: event.target.value
    })
  }
  
  // user typed in the editor
  onTextChange = (text) => {
    this.setState({
      text: text
    });
  };

  // user requested save
  onSave = (ev) => {
    this.setState({
      disableQuitPrompt: true
    }, () => {
      this.props.onClickSave(this.state);
    })
    
  }

  // user clicked a checkbox in the preview. update the editor with the proper text
  onChecked = (name) => {
    // generate markdown with that field toggled
    const newText = Remark().use(RemarkTaskList, {toggle: [name]}).processSync(this.state.text).contents;

    // codemirror doesn't pick up the change of the value attr. use callback to set it manually
    this.setState({
      text: newText
    }, () => {
      this.refs.cm_instance.getCodeMirror().setValue(newText);
    })
  }

  // sublime/vs code style: single line? put indent chars in. multiline? indent
  // FIXME: single line unindent should still unindent
  // FIXME: detect lists, tab in/out list if its in a list
  _indentListOrTab(cm, unindent) {
    const startLine = cm.getCursor('start').line;
    const endLine = cm.getCursor('end').line;
    const spaces = Array(cm.getOption("indentUnit") + 1).join(" ");

    if (startLine === endLine) {
      cm.replaceSelection(spaces);
      return;
    }

    for (let i = startLine; i <= endLine; i++) {
      if (!unindent) {
        cm.replaceRange(spaces, {line:i, ch:0});
      } else {
        cm.replaceRange("", {line:i, ch:0}, {line:i, ch:spaces.length});
      }
    }
  }

  // keyboard shortcut for stuff that puts strings in the beginning of the line
  _startOfLine(cm, str) {
    const line = cm.getCursor().line;
    const text = cm.getLine(line);
    if (!text.startsWith(str)) {
      cm.replaceRange(str, {line: line, ch:0});
    } else {
      cm.replaceRange("", {line: line, ch:0}, {line: line, ch: str.length});
    }
  }

  // keyboard shortcut for inline formatting that either inserts at position or wraps the selection in the string
  _wrapSelection(cm, str) {
    const sel = cm.getSelection();
    cm.replaceSelection(str + (sel.length ? cm.getSelection() + str : ''));
  }
  
  render() {
    const options = {
      lineNumbers: false,
      mode: 'markdown',
      theme: 'railscasts',
      viewportMargin: Infinity,
      extraKeys: {
        'Tab': (cm) => this._indentListOrTab(cm, false),
        'Shift-Tab': (cm) => this._indentListOrTab(cm, true),
        'Ctrl-1': (cm) => this._startOfLine(cm, "# "),
        'Ctrl-2': (cm) => this._startOfLine(cm, "## "),
        'Ctrl-3': (cm) => this._startOfLine(cm, "### "),
        'Ctrl-4': (cm) => this._startOfLine(cm, "#### "),
        'Ctrl-5': (cm) => this._startOfLine(cm, "##### "),
        'Ctrl-6': (cm) => this._startOfLine(cm, "###### "),
        'Ctrl-L': (cm) => this._startOfLine(cm, "- "),
        'Ctrl-.': (cm) => this._startOfLine(cm, "> "),
        'Ctrl-B': (cm) => this._wrapSelection(cm, "**"),
        'Ctrl-I': (cm) => this._wrapSelection(cm, "*"),
        'Ctrl-U': (cm) => this._wrapSelection(cm, "`"),
        'Ctrl-K': (cm) => this._wrapSelection(cm, "~~"),
        'Ctrl-S': (cm) => this.onSave()
      }
    };
    // do we need to show the reload button?
    const newerRevision = this.props.latestRev !== this.props.rev;

    const toolbar = <span>
      <NavLink className="toaster" onClick={this.props.onClickMenu}><FA name="bars"/></NavLink>
      <FA spin fixedWidth={true} name={this.props.isLoading ? "spinner" : ""}/>
      <Input readOnly={this.props.isLoading} onChange={this.onNameChange} value={this.state.name} placeholder='Path'/>
      {this.props.onClickDelete ? <NavLink onClick={() => this.props.onClickDelete(this.props.path)} ml='auto'>Delete</NavLink> : null}
      <NavLink onClick={this.props.onClickCancel} ml='auto'>Cancel</NavLink>
      {newerRevision ? <NavLink onClick={() => this.props.onClickReload(this.props.path)}>Reload Latest</NavLink> : null}
      <NavLink onClick={this.onSave}>Save</NavLink>
    </span>

    return <ToolbarView toolbar={toolbar} hasFlex={true}>
      <Prompt when={this.state.disableQuitPrompt === false && this.state.text !== this.props.text} message={"Discard changes?"}/>
      <Box w={6/10} ref="editBox" style={{overflowY: 'scroll'}}>
        {!this.props.isLoading ? <CodeMirror ref="cm_instance" className="page" onChange={this.onTextChange} value={this.state.text} options={options}/> : null }
      </Box>
      <Box w={4/10} ref="previewBox" style={{overflowY: 'hidden'}}>
        {!this.props.isLoading ? <div className="page preview"><Markdown onChecked={this.onChecked} text={this.state.text}/></div> : null }
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
    isLoading: state.viewer.isLoading,
    error: state.viewer.error
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