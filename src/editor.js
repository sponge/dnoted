import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import ReactDOM from 'react-dom';
import { Flex, Box } from 'rebass';
import Marked from 'marked';
import { Input, Toolbar, NavLink } from 'rebass'

class Editor extends Component {
  constructor() {
    super();
    
    this.state = {
      filename: "",
      body: "",
      rev: null,
      preview: ""
    }
  }
  
  componentDidMount() {
    this.renderFile(this.props.path);

    // FIXME: attach keyboard shortcuts

    this.editDOM = ReactDOM.findDOMNode(this.refs.edit)
    this.previewDOM = ReactDOM.findDOMNode(this.refs.preview)
    //this.previewDOM.addEventListener('scroll', this._handleScroll.bind(this));
    if (this.editDOM && this.previewDOM) {
      this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));
    }
  }

  _handleScroll = (ev) => {
    const scrollEle = ev.srcElement;
    const otherEle = ev.srcElement === this.editDOM ? this.previewDOM : this.editDOM;
    const pct = scrollEle.scrollTop / (scrollEle.scrollHeight - scrollEle.clientHeight);
    otherEle.scrollTop = (otherEle.scrollHeight - otherEle.clientHeight) * pct;
  }
  
  renderFile = (path) => {
    this.props.provider.getTextContents(path).then((file) => {
      this.setState({
        body: file.text,
        name: file.path,
        filename: file.name,
        rev: file.rev
      });
    })
    .catch((error) => {
      // FIXME: error handling
      console.error(error);
    })
  }

  reloadFile = () => {
    this.setState({
      body: null,
      preview: null
    });

    this.renderFile(this.props.path);
  }

  saveFile = (event) => {
    let move = new Promise((a) => a())
    
    if (this.props.path !== this.state.name) {
      move = this.props.provider.movePath(this.props.path, this.state.name);
    }

    move.then(() => {
      return this.props.provider.setTextContents(this.state.name, this.state.body);
    }).then(() => {
      // FIXME: redirect if renamed
      console.log('success?');
    }).catch((error) => {
      // FIXME: error handling
      console.log(error);
    });
  }

  onNameChange = (event) => {
    this.setState({
      name: event.target.value
    })
  }
  
  onChange = (event) => {
    this.setState({
      body: event.target.value
    });
  };
  
  componentWillUpdate(nextProps, nextState) {
    nextState.preview = nextState.body === null ? null : Marked(nextState.body);

    if (nextProps.path !== this.props.path) {
      nextState.body = null;
      nextState.preview = null;
      this.renderFile(nextProps.path);
    }
  }
  
  render() {
    const newerRevision = this.props.latestRev !== null && this.state.rev !== null && this.props.latestRev !== this.state.rev;
    return <Flex direction="column">
      <Toolbar className="view-toolbar">
        <Input onChange={this.onNameChange} value={this.state.name} placeholder='Title'/>
        <NavLink is={Link} to={this.props.path} ml='auto'>Cancel</NavLink>
        {newerRevision ? <NavLink onClick={this.reloadFile}>Reload Latest</NavLink> : null}
        <NavLink onClick={this.saveFile}>Save</NavLink>
      </Toolbar> 
      {this.state.body ? <Flex className="editor-area">
        <Box w={6/10}>
          <textarea ref="edit" className="page" onChange={this.onChange} value={this.state.body}></textarea>
        </Box>
        <Box w={4/10}>
          <div ref="preview" className="page preview" dangerouslySetInnerHTML={{__html: this.state.preview}}></div>
        </Box>
      </Flex> : null}
    </Flex>
  }
}

export default Editor;