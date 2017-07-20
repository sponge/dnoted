import React, { Component } from 'react';
import { Text, Toolbar, NavLink } from 'rebass'
import Marked from 'marked';
import { Flex, Box } from 'rebass';
import PropTypes from 'prop-types';

class Viewer extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    text: PropTypes.string,
    isLoading: PropTypes.bool,
    onClickEdit: PropTypes.func.isRequired
  }

  render() {
    console.log(this.props);
    // FIXME: disable button, pass in title from props?
    return <div>
      <Toolbar className="view-toolbar">
        {!this.props.isLoading ? <Text>{this.props.name}</Text> : null }
        {!this.props.isLoading ? <NavLink ml='auto' onClick={this.props.onClickEdit}>Edit</NavLink> : null }
      </Toolbar>
      {!this.props.isLoading ? <div className="read page" dangerouslySetInnerHTML={{__html: Marked(this.props.text)}} /> : null}
    </div>
  }
}

export default Viewer;