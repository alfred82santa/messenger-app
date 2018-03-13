import _ from 'underscore';
import $ from 'jquery';

export default class WS {

  getNextId(): number {
    return ++this._nextId;
  }

  sendRMC(rmc) {
    if (rmc.referenceId === undefined) {
        rmc.referenceId = this.getNextId();
    }

    this._ws.send(JSON.stringify(rmc));
    $(this).trigger('post', rmc);
  }

  sendCommand(command, params) {
    let cmd = {
        "method": command,
        "referenceId": this.get_next_id()
    };

    if (params !== undefined) {
        cmd.params = params;
    }

    this.sendRMC(cmd);
  }

  connect() {
    this._ws = new WebSocket(this.url);
    let self = this;

    $(this._ws).on('open', function (event) {
      $(self).trigger('open');
    })


    $(this._ws).on('close', function (event) {
      $(self).trigger('close');
      _.defer(self.connect);
    })

    $(this._ws).on('message', function (event) {
      let msg = JSON.parse(event.originalEvent.data);
      $(self).trigger('message', msg);
    })
  }

  constructor(url: string) {
    this._nextId = 0;
    this.url = url;
    this.connect();
  }
}
