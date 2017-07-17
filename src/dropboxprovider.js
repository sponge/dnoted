import Dropbox from 'dropbox';
import EventEmitter from 'event-emitter-es6';
// note: using fetch because of https://github.com/dropbox/dropbox-sdk-js/issues/85

class DropboxProvider extends EventEmitter {
  constructor(access_token) {
    super()
    this.dbx = new Dropbox({accessToken: access_token});
    this.access_token = access_token;
    this.cursor = null;
    this.active = false;

    this.dbx.filesListFolder({path: '', recursive: true})
      .then(this._fileslistFolderHandler)
      .catch((error) => {
        console.error(error);
      });
  }

  getFileRevisions = (path) => {
    const revPromise = new Promise((resolve, reject) => {
      this.dbx.filesListRevisions({path: path}).then((response) => {
        resolve(response.entries);
      })
      .catch(reject);
    });

    return revPromise;
  }

  getTextContents = (path) => {
    const filePromise = new Promise((resolve, reject) => {
      this.dbx.filesDownload({path: path}).then((response) => {
        const blob = response.fileBlob;
        const reader = new FileReader();
        reader.addEventListener("loadend", (reader) => {
          resolve({text: reader.target.result, rev: response.rev});
        });
        reader.readAsText(blob);
      })
      .catch(reject);
    });

    return filePromise;
  }

  _fileslistFolderHandler = (response) => {
    this.cursor = response.cursor;
    this.emit("update", response.entries)
    setTimeout(this._waitForUpdate, 0);
  }

  _waitForUpdate = () => {
    this.active = true;
    fetch('https://notify.dropboxapi.com/2/files/list_folder/longpoll', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'text/plain; charset=dropbox-cors-hack'}),
      body: `{"cursor":"${this.cursor}"}`
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      console.error("Failed to longpoll, killing update loop:", error);
      this.active = false;
    }).then((resp) => {
      if (resp.changes === false) {
        setTimeout(this._waitForUpdate, 0);
        return;
      }

      this.dbx.filesListFolderContinue({cursor: this.cursor}).then(this._fileslistFolderHandler);
    })
  };

}

export default DropboxProvider