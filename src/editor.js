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
      preview: ""
    }
  }
  
  componentDidMount() {
    this.renderFile(this.props.path);

    this.editDOM = ReactDOM.findDOMNode(this.refs.edit)
    this.previewDOM = ReactDOM.findDOMNode(this.refs.preview)
    //this.previewDOM.addEventListener('scroll', this._handleScroll.bind(this));
    this.editDOM.addEventListener('scroll', this._handleScroll.bind(this));

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
        filename: file.name
      });
    })
    .catch((error) => {
      console.error(error);
    })
  }

  saveFile = (event) => {
    let move = new Promise((a) => a())
    const newPath = this.props.path.split('/').slice(0,-1).join('/')+'/'+this.state.filename;
    
    if (!this.props.path.endsWith(this.state.filename)) {
      move = this.props.provider.movePath(this.props.path, newPath);
    }

    move.then(() => {
      return this.props.provider.setTextContents(newPath, this.state.body);
    }).then(() => {
      console.log('success?');
    }).catch((error) => {
      console.log(error);
    });

    console.log(move);
  }

  onNameChange = (event) => {
    this.setState({
      filename: event.target.value
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
    return <Flex direction="column">
      <Toolbar className="view-toolbar">
        <Input onChange={this.onNameChange} value={this.state.filename} placeholder='Title'/>
        <NavLink is={Link} to={this.props.path} ml='auto'>Cancel</NavLink>
        <NavLink onClick={this.saveFile}>Save</NavLink>
      </Toolbar> 
      <Flex className="editor-area">
        <Box w={6/10}>
          <textarea ref="edit" className="page" onChange={this.onChange} value={this.state.body}></textarea>
        </Box>
        <Box w={4/10}>
          <div ref="preview" className="page preview" dangerouslySetInnerHTML={{__html: this.state.preview}}></div>
        </Box>
      </Flex>
    </Flex>
  }
}

export default Editor;