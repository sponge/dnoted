import { combineReducers } from 'redux'
import { filter, forEach } from 'lodash';
import Remark from 'remark';
import RemarkTaskList from 'remark-task-list';

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

    case 'RELOAD_FILE_REJECTED':
    case 'VIEW_FILE_REJECTED':
      newState = {
        isLoading: false,
        isLoaded: false,
        error: true,
        text: `Error while showing page: ${action.payload}`
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
    
    case 'TOGGLE_TASK_LIST_ITEM': {
      const ns = {};
      ns.text = Remark().use(RemarkTaskList, {toggle: [action.item]}).processSync(state.text).contents;
      return {...state, ...ns};
    }

    case 'SHARE_FILE_PENDING':
      newState = {
        showShare: true,
        links: []
      }

      return {...state, ...newState};

    case 'SHARE_FILE_FULFILLED':
      newState = {
        links: action.payload
      }

      return {...state, ...newState}

    case 'HIDE_SHARE':
      newState = {
        showShare: false
      }

      return {...state, ...newState};

    default:
      return state;
  }
}

// INDEX BUILDER

// finds the deepest node given a path, stops when it can't find one
function findNodeForPath(node, path, index) {   
  // traverse the tree
  let pathStr = '';
  if (path[0] === '/') {
    path = path.substr(1);
  }

  forEach(path.split('/'), (subpath) => {
    pathStr += '/'+subpath;
    if (pathStr in index.byPath) {
      node = index.byPath[pathStr];
    } else {
      return false;
    }
  });

  return node;
}

// shortcut for indexOf + splice
function deleteItem(arr, item) {
  const id = arr.indexOf(item);
  if (id === -1) {
    return false;
  }
  arr.splice(id, 1);
  return true;
}


const initialState = {
  byPath: {'/': 
    {
      id: 'root',
      name: 'Main',
      path_lower: '/', // used for key
      path_display: '/', // used for display
      expanded: true, // whether to show children in launcher
      children: [], // path for subfolders
      files: [], // path for files in this folder
      parent: null,
      indexId: undefined // path to file to make folder clickable.
    }
  }
}

const index = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_INDEX':
      const ns = {...state};

      // handle file deletes
      filter(action.updates, {'.tag': 'deleted'}).forEach((removed) => {
        const item = ns.byPath[removed.path_lower];

        // remove this item from all places (subfolder, item, and id/path lookups)
        let parent = ns.byPath[item.parent];
        if (parent.indexId === item.path_lower) {
          parent.indexId = null;
        }

        // just try deleting from both folder and files, we don't care
        deleteItem(parent.children, item.path_lower);
        deleteItem(parent.files, item.path_lower);
        delete ns.byPath[removed.path_lower];
      });

      // add all new folders first because they need to exist before we add files in
      filter(action.updates, {'.tag': 'folder'}).forEach((folder) => {
        // find the folder this folder sits in
        let node = findNodeForPath(ns.byPath['/'], folder.path_lower, ns);

        // make the new folder
        let newFolder = {
          id: folder.id,
          name: folder.name,
          path_lower: folder.path_lower,
          path_display: folder.path_display,
          expanded: true,
          children: [],
          files: [],
          parent: node.path_lower,
          indexId: null
        };

        // add the path to here the folder it sits in and add it to the global index of all nodes
        node.children.push(newFolder.path_lower);
        ns.byPath[folder.path_lower] = newFolder;
      });

      // now add all new files
      filter(action.updates, {'.tag': 'file'})
        .filter((f) => { return f.name.endsWith('.md') })
        .forEach((file) => {
          // we're just taking the provider returned object and dumping it in.

          // strip off the filename so we can find the folder it belongs in
          const path = file.path_lower.substr(0,file.path_lower.length-file.name.length);
          let node = findNodeForPath(ns.byPath['/'], path, ns);

          // add the path to the folder that it sits in for easy reference
          file.parent = node.path_lower;
          
          // treat index.md specially so you can click on the folder and not show index.md in the folder list
          if (file.name === "index.md") {
            node.indexId = file.path_lower;
          } else {
            node.files.push(file.path_lower);
          }

          // add to the global index
          ns.byPath[file.path_lower] = file;
        });

        return ns;

    case 'TOGGLE_FOLDER_VISIBILITY': {
      const ns = {...state};

      let node = ns.byPath[action.path];
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