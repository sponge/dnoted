import React, { Component } from 'react';
import Marked from 'marked';

class MarkdownViewer extends Component {
  constructor() {
    super();

    this.state = {
      body: null
    }
  }

  componentDidMount() {
    this.renderFile(this.props.path);
  }

  renderFile = (path) => {
    this.props.provider.getTextContents(path).then((text) => {
      this.setState({body: Marked(text)});
    })
    .catch((error) => {
      console.error(error);
    })
  }
  
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.path !== this.props.path) {
      nextState.body = "";
      this.renderFile(nextProps.path);
    }
  }

  render() {
    return <div className="page" dangerouslySetInnerHTML={{__html: this.state.body}} />;
  }
}

export default MarkdownViewer;