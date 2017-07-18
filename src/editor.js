import React, { Component } from 'react';
import { Flex, Box } from 'rebass';
import Marked from 'marked';

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
      <textarea className="page" onChange={this.onChange} value={this.state.body}></textarea>
      <div className="page preview" dangerouslySetInnerHTML={{__html: this.state.preview}}></div>
    </div>
  }
}

export default Editor;