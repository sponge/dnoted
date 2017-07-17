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
      files: new Set(),
      parent: undefined
    };
    this.byId = new Map();
    this.byPath = new Map();
  }

  updateIndex = (update) => {
    console.log("index builder got update from dropbox", update);

    _(update).filter({'.tag': 'deleted'}).forEach((removed) => {
      const id = this.byPath.get(removed.path_lower);
      const item = this.byId.get(id);

      delete item.parent.children[removed.name];
      item.parent.files.delete(id);
      this.byId.delete(id);
      this.byPath.delete(removed.path_lower);
    });

    _(update).filter({'.tag': 'folder'}).forEach((folder) => {
      let node = this._findNodeForPath(folder.path_lower);

      let newFolder = {
        id: folder.id,
        name: folder.name,
        path_lower: folder.path_lower,
        path_display: folder.path_display,
        children: {},
        files: new Set(),
        parent: node
      };

      node.children[newFolder.name] = newFolder;
      this.byId.set(folder.id, newFolder);
      this.byPath.set(folder.path_lower, newFolder.id);
    });

    _(update).filter({'.tag': 'file'})
      .filter((f) => { return f.name.endsWith('.md') })
      .forEach((file) => {
        const path = file.path_lower.substr(0,file.path_lower.length-file.name.length);
        let node = this._findNodeForPath(path);

        file.parent = node;
        node.files.add(file.id);

        this.byId.set(file.id, file);
        this.byPath.set(file.path_lower, file.id);
      });
    
    console.log(this);
    this.emit('change', this);
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