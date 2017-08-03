import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'rebass';
import { Toolbar } from 'rebass'

class ToolbarView extends Component {
  static propTypes = {
    toolbar: PropTypes.element, // items that go in the toolbar
    hasFlex: PropTypes.bool // editor needs flex, everything else doesn't
  }
    
  render() {
    let styles = {height: '100%', overflow: 'auto'};
    if (this.props.hasFlex) {
      styles.flex = '1 1 auto'
    }
    return <Flex direction="column" style={{height: '100%'}}>
      <Toolbar className="view-toolbar" style={{flex: '0 0 auto'}}>
        {this.props.toolbar.props.children}
      </Toolbar>
      {this.props.hasFlex ? <Flex style={styles}>{this.props.children}</Flex> : <div style={styles}>{this.props.children}</div>}
    </Flex>
  }
}

export default ToolbarView;