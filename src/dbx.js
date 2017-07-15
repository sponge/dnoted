import Dropbox from 'dropbox';

const dbx = new Dropbox({ accessToken: localStorage["access_token"] });

export default dbx;