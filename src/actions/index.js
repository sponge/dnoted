import { createAction } from 'redux-actions'
import DropboxProvider from '../dropboxprovider.js';
const provider = new DropboxProvider(localStorage['access_token']);

export const viewFile = createAction('VIEW_FILE', provider.getTextContents);

export function updateFileIndex(updates) {
    return { type: 'UPDATE_INDEX', updates };
}