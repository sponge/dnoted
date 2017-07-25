import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'rebass';
import { Toolbar } from 'rebass'

class ToolbarView extends Component {
  static propTypes = {
    toolbar: PropTypes.element
  }
    
  render() {
    return <Flex direction="column" style={{height: '100%'}}>
      <Toolbar className="view-toolbar" style={{flex: '0 0 auto'}}>
        {this.props.toolbar.props.children}
      </Toolbar>
      <Flex style={{flex: '1 1 auto', height: '100%', overflow: 'auto'}}>
        {this.props.children}
      </Flex>
    </Flex>
  }
}

export default ToolbarView;