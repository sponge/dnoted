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
        body: file.text
      });
    })
    .catch((error) => {
      console.error(error);
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
    return <div>
      <Toolbar className="view-toolbar">
        <Input defaultValue={this.props.path} placeholder='Title'/>
        <NavLink is={Link} to={this.props.path} ml='auto'>Cancel</NavLink>
        <NavLink>Save</NavLink>
      </Toolbar> 
      <Flex className="editor-area">
        <Box w={6/10}>
          <textarea ref="edit" className="page" onChange={this.onChange} value={this.state.body}></textarea>
        </Box>
        <Box w={4/10}>
          <div ref="preview" className="page preview" dangerouslySetInnerHTML={{__html: this.state.preview}}></div>
        </Box>
      </Flex>
    </div>
  }
}

export default Editor;