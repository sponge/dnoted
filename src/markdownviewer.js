import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Remark from 'remark';
import ReactRenderer from 'remark-react';

class WikiLink extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  
  render() {
    try {
      const {href, children} = this.props;
      const url = new URL(href, document.location.origin + this.context.router.route.location.pathname);
      const outsideDomain = url.origin !== document.location.origin;
      const newHref = outsideDomain ? href : this.context.router.history.createHref({pathname:url.pathname});
      return <a target={outsideDomain ? "_blank" : ""} href={newHref}>{children}</a>;
    } catch (e) {
      console.info("Caught exception in markdown link renderer:", e);
      const {href, children} = this.props;
      return <a href={href}>{children}</a>;      
    }
  }
}

class Markdown extends Component {
  render() {
    const options = {
      sanitize: false,
      remarkReactComponents: {
        a: WikiLink
      }
    }
    return Remark().use(ReactRenderer, options).processSync(this.props.text).contents;
  }
}

export default Markdown