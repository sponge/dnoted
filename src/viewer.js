import React, { Component } from 'react';
import Marked from 'marked';

class Viewer extends Component {
  constructor() {
    super();

    this.state = {
      body: ""
    }
  }

  componentDidMount() {
    this.renderFile(this.props.path);
  }

  renderFile = (path) => {
    this.props.provider.getTextContents(path).then((file) => {
      this.setState({body: Marked(file.text)});
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
    return <div className="read page" dangerouslySetInnerHTML={{__html: this.state.body}} />;
  }
}

export default Viewer;