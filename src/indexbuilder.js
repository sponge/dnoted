import EventEmitter from 'event-emitter-es6';
import _ from 'lodash';

class IndexBuilder extends EventEmitter {
  constructor() {
    super()
    this.index = {
      id: 'root',
      name: '/',
      path_lower: '/',
      path_display: '/',
      children: {},
      files: []
    };
    this.byId = {};
  }

  updateIndex = (update) => {
    console.log("index builder got update from dropbox", update);

    update.forEach((f) => { this.byId[f.id] = f; });

    _(update).filter({'.tag': 'folder'}).forEach((folder) => {
      var newFolder = {
        id: folder.id,
        name: folder.name,
        path_lower: folder.path_lower,
        path_display: folder.path_display,
        children: {},
        files: []
      }

      let node = this._findNodeForPath(folder.path_lower);
      node.children[newFolder.name] = newFolder;
    });

    _(update).filter({'.tag': 'file'})
      .filter((f) => { return f.name.endsWith('.md') })
      .forEach((file) => {
        const path = file.path_lower.substr(0,file.path_lower.length-file.name.length);
        let node = this._findNodeForPath(path);
        node.files.push(file.id);
      });
      
    console.log(this);
  }

  _findNodeForPath(path) {
    let node = this.index;
    
    if (path[0] === '/') {
      path = path.substr(1);
    }

    _(path.split('/')).forEach((subpath) => {
      if (subpath in node.children) {
        node = node.children[subpath];
      } else {
        return false;
      }
    });

    return node;
  }
}

export default IndexBuilder;