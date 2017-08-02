import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Remark from 'remark';
import ReactRenderer from 'remark-react';
import RemarkTaskList from 'remark-task-list';

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
  static propTypes = {
    text: PropTypes.string.isRequired,
    onChecked: PropTypes.func
  }

  render() {
    let onChecked = this.props.onChecked;

    const options = {
      sanitize: false,
      remarkReactComponents: {
        li: (props) => {
          // this is awful but it transforms list items that are task lists into checkbox + label
          if (props.className && props.className.indexOf('task-list-item') >= 0) {
            const checkbox = props.children.shift();
            const labelChildren = props.children.splice(0);

            props.children.push(<input type="checkbox" id={'check-'+props.id} key={'check-'+props.id} checked={checkbox.props.checked !== undefined} onChange={(ev) => onChecked(ev.target.parentElement.id)} />);
            props.children.push(<label key={'label-'+props.id} htmlFor={'check-'+props.id}>{labelChildren}</label>);
          }

          return <li {...props}>{props.children}</li>;
        },

        a: WikiLink
      }
    }

    return Remark().use(ReactRenderer, options).use(RemarkTaskList).processSync(this.props.text).contents;
  }
}

export default Markdown