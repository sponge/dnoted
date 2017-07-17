import React, { Component } from 'react';
import Dropbox from 'dropbox';
import Marked from 'marked';

class DropboxViewer extends Component {
  constructor() {
    super();

    this.state = {
      body: null
    }

    this.dbx = new Dropbox({ accessToken: localStorage["access_token"] });
  }

  componentDidMount() {
    this.renderFile(this.props.path);
  }

  renderFile = (path) => {
    this.dbx.filesDownload({path: path}).then((response) => {
      const blob = response.fileBlob;
      const reader = new FileReader();
      reader.addEventListener("loadend", (reader) => {
        this.setState({body: Marked(reader.target.result)});
      });
      reader.readAsText(blob);
    })
    .catch((error) => {
      console.error(error);
    })
  }
  
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.path !== this.props.path) {
      nextState.body = "Loading...";
      this.renderFile(nextProps.path);
    }
  }

  render() {
    return <div>
      <h1>{this.props.path}</h1>
      <p dangerouslySetInnerHTML={{__html: this.state.body}}></p>
    </div>;
  }
}

export default DropboxViewer;