import { combineReducers } from 'redux'
import _ from 'lodash';

const viewer = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case 'RELOAD_FILE_PENDING':
      newState = {
        isLoading: true,
      };
      return {...state, ...newState};

    case 'VIEW_FILE_PENDING':
      newState = {
        isLoading: true,
        isLoaded: false,
        error: false
      };
      return newState;

    case 'RELOAD_FILE_FULFILLED':
    case 'VIEW_FILE_FULFILLED':
      newState = {
        isLoading: false,
        isLoaded: true,
        latestRev: action.payload.rev
      };
      return {...state, ...newState, ...action.payload};

    case 'VIEW_FILE_REJECTED':
      newState = {
          isLoading: false,
          isLoaded: false,
          error: true
        }
      return newState;

    case 'CLEAR_FILE':
      newState = {
        isLoading: false,
        isLoaded: true,
        latestRev: null,
        name: "",
        path: null,
        rev: null,
        text: ""
      }

      return {...state, ...newState};

    case 'LOADING_START':
    case 'LOADING_END':
      newState = {
        isLoading: action.type === 'LOADING_START'
      }

      return {...state, ...newState};

    case 'UPDATE_INDEX':
      const ns = {};
      const currentFile = action.updates.filter((item) => item.path_lower === state.path);
      if (currentFile.length) {
        ns.latestRev = currentFile[0].rev;
      }

      return {...state, ...ns};

    default:
      return state;
  }
}

// INDEX BUILDER

// navigates through the tree looking for the folder path and returns that node
function findNodeForPath(node, path, index) {   
  // traverse the tree
  let pathStr = '';
  if (path[0] === '/') {
    path = path.substr(1);
  }

  _(path.split('/')).forEach((subpath) => {
    pathStr += '/'+subpath;
    if (pathStr in index.byPath) {
      node = index.byId[ index.byPath[pathStr] ];
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
  byId: {'root': {
    id: 'root',
    name: 'Main',
    path_lower: '/',
    path_display: '/',
    expanded: true,
    children: [],
    files: [],
    parent: null,
    indexId: null
  }},
  byPath: {'/': 'root'}
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
        let parent = ns.byId[item.parent];
        if (parent.indexId === id) {
          parent.indexId = null;
        }

        deleteItem(parent.children, removed.id);
        deleteItem(parent.files, id);
        delete ns.byId[id];
        delete ns.byPath[removed.path_lower];
      });

      // add all new folders first because they need to exist before we add files in
      _(action.updates).filter({'.tag': 'folder'}).forEach((folder) => {
        let node = findNodeForPath(ns.byId['root'], folder.path_lower, ns);

        let newFolder = {
          id: folder.id,
          name: folder.name,
          path_lower: folder.path_lower,
          path_display: folder.path_display,
          expanded: true,
          children: [],
          files: [],
          parent: node.id,
          indexId: null
        };

        node.children.push(newFolder.id);
        ns.byId[folder.id] = newFolder;
        ns.byPath[folder.path_lower] = newFolder.id;
      });

      // now add all new files
      _(action.updates).filter({'.tag': 'file'})
        .filter((f) => { return f.name.endsWith('.md') })
        .forEach((file) => {
          // strip off the filename so we can find the node it belongs in
          const path = file.path_lower.substr(0,file.path_lower.length-file.name.length);
          let node = findNodeForPath(ns.byId['root'], path, ns);

          file.parent = node.id;
          
          if (file.name === "index.md") {
            node.indexId = file.id;
          } else {
            node.files.push(file.id);
          }

          ns.byId[file.id] = file;
          ns.byPath[file.path_lower] = file.id;
        });

        return ns;

    case 'TOGGLE_FOLDER_VISIBILITY': {
      const ns = {...state};

      let node = action.path === '/' ? ns.byId['root'] : ns.byId[ ns.byPath[action.path] ]
      if (!node) {
        return;
      }
      node.expanded = !node.expanded;

      return ns;
    }

    default:
      return state;
  }
}

const rootReducer = combineReducers({viewer, index});
export default rootReducer;