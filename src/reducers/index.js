import { combineReducers } from 'redux'
import _ from 'lodash';

const viewer = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case 'VIEW_FILE_PENDING':
      newState = {
        isLoading: true,
        error: false
      };
      return newState;

    case 'UPDATE_INDEX':
      console.log('FIXME: check if im on the right revision');
      return state;

    case 'VIEW_FILE_FULFILLED':
      newState = {
        isLoading: false,
      };
      return { ...state, ...newState, ...action.payload};

    case 'VIEW_FILE_REJECTED':
      newState = {
          isLoading: false,
          error: true
        }
      return newState;

    default:
      return state;
  }
}

// INDEX BUILDER

// navigates through the tree looking for the folder path and returns that node
function findNodeForPath(node, path) {   
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

function deleteItem(arr, item) {
  const id = arr.indexOf(item);
  if (id === -1) {
    return false;
  }
  arr.splice(id, 1);
  return true;
}

const initialState = {
  tree: {
    id: 'root',
    name: 'Main',
    path_lower: '/',
    path_display: '/',
    children: {},
    files: [],
    parent: undefined,
    indexId: null
  },

  byId: {},
  byPath: {}
}

const index = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_INDEX':
      const ns = {...state};

      // handle file deletes
      _(action.updates).filter({'.tag': 'deleted'}).forEach((removed) => {
        // dropbox doesn't give us an id, so lets get our object based on the dropbox passed delete
        const id = ns.byPath[removed.path_lower];
        const item = ns.byId[id];

        // remove this item from all places (subfolder, item, and id/path lookups)
        if (item.parent.indexId === id) {
          item.parent.indexId = null;
        }
        delete item.parent.children[removed.name];
        deleteItem(item.parent.files, id);
        delete ns.byId[id];
        delete ns.byPath[removed.path_lower];
      });

      // add all new folders first because they need to exist before we add files in
      _(action.updates).filter({'.tag': 'folder'}).forEach((folder) => {
        let node = findNodeForPath(ns.tree, folder.path_lower);

        // FIXME: duplicate code
        let newFolder = {
          id: folder.id,
          name: folder.name,
          path_lower: folder.path_lower,
          path_display: folder.path_display,
          children: {},
          files: [],
          parent: node,
          indexId: null
        };

        // FIXME: check if an index exists

        node.children[newFolder.name] = newFolder;
        ns.byId[folder.id] = newFolder;
        ns.byPath[folder.path_lower] = newFolder.id;
      });

      // now add all new files
      _(action.updates).filter({'.tag': 'file'})
        .filter((f) => { return f.name.endsWith('.md') })
        .forEach((file) => {
          // strip off the filename so we can find the node it belongs in
          const path = file.path_lower.substr(0,file.path_lower.length-file.name.length);
          let node = findNodeForPath(ns.tree, path);

          file.parent = node;
          
          if (file.name === "index.md") {
            node.indexId = file.id;
          } else {
            node.files.push(file.id);
          }

          ns.byId[file.id] = file;
          ns.byPath[file.path_lower] = file.id;
        });

        return ns;

    default:
      return state;
  }
}

const rootReducer = combineReducers({viewer, index});
export default rootReducer;