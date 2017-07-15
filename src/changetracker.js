import Dropbox from 'dropbox';
// note: using fetch because of https://github.com/dropbox/dropbox-sdk-js/issues/85

class ChangeTracker {
  constructor(access_token) {
    this.dbx = new Dropbox({accessToken: access_token});
    this.access_token = access_token;
    this.cursor = null;
    this.active = false;

    this.dbx.filesListFolder({path: ''})
      .then(this._fileslistFolderHandler)
      .catch((error) => {
        console.error(error);
      });
  }

  _fileslistFolderHandler = (response) => {
    console.log(response);
    this.cursor = response.cursor;
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
    // this.dbx.filesListFolderLongpoll({
    //   cursor: this.cursor
    // }).then((response) => {
    //   console.log(response);
    // }).catch((error) => {
    //   console.log(error);
    //   clearInterval(this.hnd);
    // })
  };

}

export default ChangeTracker