import EventEmitter from 'event-emitter-es6';
import _ from 'lodash';

class IndexBuilder extends EventEmitter {
  constructor() {
    super()
    // root node for tree-based view
    this.index = {
      id: 'root',
      name: '/',
      path_lower: '/',
      path_display: '/',
      children: {},
      files: new Set(),
      parent: undefined
    };
    // listing of everything in dropbox by dropbox id
    this.byId = new Map();
    // listing of everything in dropbox by path_lower
    this.byPath = new Map();
  }

  // update the index based on the passed in update
  updateIndex = (update) => {
    console.log("index builder got update from dropbox", update);

    // handle file deletes
    _(update).filter({'.tag': 'deleted'}).forEach((removed) => {
      // dropbox doesn't give us an id, so lets get our object based on the dropbox passed delete
      const id = this.byPath.get(removed.path_lower);
      const item = this.byId.get(id);

      // remove this item from all places (subfolder, item, and id/path lookups)
      delete item.parent.children[removed.name];
      item.parent.files.delete(id);
      this.byId.delete(id);
      this.byPath.delete(removed.path_lower);
    });

    // add all new folders first because they need to exist before we add files in
    _(update).filter({'.tag': 'folder'}).forEach((folder) => {
      let node = this._findNodeForPath(folder.path_lower);

      // FIXME: duplicate code
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

    // now add all new files
    _(update).filter({'.tag': 'file'})
      .filter((f) => { return f.name.endsWith('.md') })
      .forEach((file) => {
        // strip off the filename so we can find the node it belongs in
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

  // navigates through the tree looking for the folder path and returns that node
  _findNodeForPath(path) {
    let node = this.index;
    
    // strip out leading / to not confuse split
    if (path[0] === '/') {
      path = path.substr(1);
    }

    // traverse the tree
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