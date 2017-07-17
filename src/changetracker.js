import Dropbox from 'dropbox';
import EventEmitter from 'event-emitter-es6';
// note: using fetch because of https://github.com/dropbox/dropbox-sdk-js/issues/85

class ChangeTracker extends EventEmitter {
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

export default ChangeTracker