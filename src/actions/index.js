import { createAction } from 'redux-actions'
import DropboxProvider from '../dropboxprovider.js';

let provider = undefined;

function lateBindToken(cb, ...args) {
    if (provider === undefined) {
        provider = new DropboxProvider(localStorage.getItem('access_token'), localStorage.getItem('cursor'));
    }

    return provider[cb](...args);
}

export const viewFile = createAction('VIEW_FILE', lateBindToken.bind(this, 'getTextContents'));
export const reloadFile = createAction('RELOAD_FILE', lateBindToken.bind(this, 'getTextContents'));
export const shareFile = createAction('SHARE_FILE', lateBindToken.bind(this, 'getSharedLink'));

export function clearFile() {
    return { type: 'CLEAR_FILE' };  
}

export function updateFileIndex(updates) {
    return { type: 'UPDATE_INDEX', updates };
}

export function startLoading() {
    return { type: 'LOADING_START' };
}

export function stopLoading() {
    return { type: 'LOADING_END' };
}

export function hideShare() {
    return { type: 'HIDE_SHARE' };
}

export function toggleFolderVisibility(path) {
    return { type: 'TOGGLE_FOLDER_VISIBILITY', path};
}

export function toggleTaskListItem(item) {
    return { type: 'TOGGLE_TASK_LIST_ITEM', item};
}