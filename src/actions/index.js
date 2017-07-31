import { createAction } from 'redux-actions'
import DropboxProvider from '../dropboxprovider.js';
const provider = new DropboxProvider(localStorage['access_token']);

export const viewFile = createAction('VIEW_FILE', provider.getTextContents);
export const reloadFile = createAction('RELOAD_FILE', provider.getTextContents);

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

export function toggleFolderVisibility(path) {
    return { type: 'TOGGLE_FOLDER_VISIBILITY', path};
}