import React, { Component } from 'react';
import { Overlay, Heading, Fixed } from 'rebass';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FA from 'react-fontawesome';
import { hideShare } from './actions';

class ShareOverlay extends Component {
  static propTypes = {
    show: PropTypes.bool,
    links: PropTypes.array,
    onHide: PropTypes.func.isRequired
  }

  render() {
    if (this.props.show !== true) {
      return null;
    }

    if (!this.props.links.length) {
      return <div>
        <Fixed top right bottom left onClick={() => {this.props.onHide()}} />
        <Overlay style={{textAlign: 'center'}} className="overlay" w={24}>
          <FA spin fixedWidth={true} name={!this.props.links.length ? "spinner" : ""}/>
        </Overlay>
      </div>
    }

    return <div>
			<Fixed top right bottom left onClick={() => {this.props.onHide()}} />
      <Overlay className="overlay" w={600}>
        <Heading>Sharing</Heading>
        <p><a target="_blank" href={this.props.links[0]}>{this.props.links[0]}</a></p>
      </Overlay>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    show: state.viewer.showShare,
    path: state.viewer.path,
    links: state.viewer.links
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onHide: () => dispatch(hideShare()),
  }
}

const ConnectedShareOverlay = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareOverlay)

export {ConnectedShareOverlay, ShareOverlay};