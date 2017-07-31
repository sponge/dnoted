import Dropbox from 'dropbox';
import EventEmitter from 'event-emitter-es6';
// note: using fetch because of https://github.com/dropbox/dropbox-sdk-js/issues/85

// FIXME: pass a wrapped error back to make it slightly more vendor agnostic

class DropboxProvider extends EventEmitter {
  constructor(access_token, cursor) {
    super()
    this.dbx = new Dropbox({accessToken: access_token});
    this.access_token = access_token;
    this.cursor = cursor;
    this.active = false;

    if (this.cursor) {
      setTimeout(this._waitForUpdate, 0);
    } else {
      this.dbx.filesListFolder({path: '', recursive: true})
        .then(this._fileslistFolderHandler)
        .catch((error) => {
          console.error(error);
        });
    }
  }

  movePath = (oldPath, newPath) => {
    // FIXME: should probably pass something relevant back
    const movePromise = new Promise((resolve, reject) => {
      this.dbx.filesMove({
        from_path: oldPath,
        to_path: newPath
      }).then((response) => {
        resolve();
      }).catch((error) => {
        console.error(error);
        reject();
      });
    });

    return movePromise;
  }

  getFileRevisions = (path) => {
    // FIXME: don't use dropbox responses directly, make our own object
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
          resolve({
            name: response.name,
            text: reader.target.result,
            path: response.path_lower,
            rev: response.rev
          });
        });
        reader.readAsText(blob);
      })
      .catch(reject);
    });

    return filePromise;
  }

  setTextContents = (path, text) => {
    // FIXME: should probably pass something relevant back
    const filePromise = new Promise((resolve, reject) => {
      this.dbx.filesUpload({ path: path, mute: true, contents: text, mode:{'.tag': 'overwrite'} }).then((response) => {
        resolve();
      })
      .catch(reject);
    });

    return filePromise;
  }

  _fileslistFolderHandler = (response) => {
    this.cursor = response.cursor;
    this.emit("update", response.entries);
    setTimeout(this._waitForUpdate, 0);
  }

  _waitForUpdate = () => {
    // FIXME: emit event for polling reconnected
    this.active = true;
    fetch('https://notify.dropboxapi.com/2/files/list_folder/longpoll', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'text/plain; charset=dropbox-cors-hack'}),
      body: `{"cursor":"${this.cursor}"}`
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      console.error("Failed to longpoll, killing update loop:", error);
      // FIXME: emit event for polling stopped (badge to the left of Main?)
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