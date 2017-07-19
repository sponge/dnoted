import React, { Component } from 'react';
import { Text, Toolbar, NavLink } from 'rebass'
import { Link } from 'react-router-dom'
import Marked from 'marked';
import { Flex, Box } from 'rebass';

class Viewer extends Component {
  constructor() {
    super();

    this.state = {
      filename: "",
      rev: "",
      body: ""
    }
  }

  componentDidMount() {
    this.renderFile(this.props.path);
  }

  renderFile = (path) => {
    this.props.provider.getTextContents(path).then((file) => {
      this.setState({
        body: Marked(file.text),
        filename: file.name
      });
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
    return <div>
      <Toolbar className="view-toolbar">
        <Text>{this.state.filename}</Text>
        <NavLink ml='auto' is={Link} to={"/edit"+this.props.path}>Edit</NavLink>
      </Toolbar>
      {this.state.body.length ? <div className="read page" dangerouslySetInnerHTML={{__html: this.state.body}} /> : null}
    </div>
  }
}

export default Viewer;