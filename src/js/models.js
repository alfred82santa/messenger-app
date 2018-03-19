import Backbone from 'backbone';
import $ from 'jquery';
import WS from './websocket.js';


var Models = {};

var BaseModel = Backbone.Model.extend({}, {
  parseModel: function (app, model) {
    return new this(model);
  },
});

var BaseModelCollection = Backbone.Collection.extend({

  parseModel: function (app, model) {
    let modelOriginal = this.get(model.id);

    if (modelOriginal) {
      if (modelOriginal.modified < model.modified) {
        modelOriginal.set(this.model.parseModel(app, model).toJSON());
      }
    } else {
      modelOriginal = this.model.parseModel(app, model);
      this.add(modelOriginal);
      modelOriginal.on('change:sorting', () => this.sort());
    }

    return modelOriginal;
  }
});

var BaseModule = BaseModelCollection.extend({

  dispatch: function (app, method, params) {

  }
});


Models.Peer = BaseModel.extend({}, {
  parseModel: function (app, model) {
    model.contact = app.get('contacts').getContactByPeer(app, model);
    model.connectorId = model.accountServiceId;
    delete model.accountServiceId;
    return new this(model);
  }
});

Models.PeerCollection = BaseModelCollection.extend({
  model: Models.Peer
});

Models.Attachment = BaseModel.extend({}, {
  parseModel: function (app, model) {
    model.account = app.get('accounts').parseModel(app, model.accountSnapshot);
    delete model.accountSnapshot;
    return new this(model);
  }
});

Models.AttachmentCollection = BaseModule.extend({
  model: Models.Attachment
});

Models.Message = BaseModel.extend({
  initialize: function() {
    this.set('attachments', new Models.AttachmentCollection());
  }
}, {
  parseModel: function (app, model) {
    model.room = app.get('rooms').parseModel(app, model.roomSnapshot);
    delete model.roomSnapshot.senderSnapshot;

    model.messageRefs = model.messageSnapshotRefs.map((item => {
      return app.get('messages').parseModel(item);
    }))
    delete model.messageSnapshotRefs;

    if (model.senderSnapshot) {
      model.sender = model.room.get('peers').findWhere({
        id: model.senderSnapshot.id,
        connectorId: model.senderSnapshot.accountServiceId
      });
      delete model.senderSnapshot;
    }

    model.mentions = model.mentions.map((item) => {
      item.peer = Models.Peer.parseModel(app, item.peer);
      return item;
    })

    let attachments = new Models.AttachmentCollection();

    for (let idx in model.attachmentsSnapshots) {
      let att = app.get('attachments').parseModel(app, model.attachmentsSnapshots[idx]);
      attachments.add(att);
    }
    delete model.attachmentsSnapshots;
    model.attachments = attachments;

    // Workaround: datetime must come as timestamps.
    let d = model.postTimestamp.split(" ");
    d[0] = d[0].split('-').reverse().join('-');
    d = Date.parse(d.join('T'));
    model.sorting = d;

    return new this(model);
  }
});

Models.MessageCollection = BaseModelCollection.extend({
  model: Models.Message,
  comparator: 'sorting'
});

Models.Room = BaseModel.extend({
  initialize: function() {
    this.set('messages', new Models.MessageCollection());

    let self = this;
    this.get('messages').on('add', function(item) {
      if (-self.get('sorting') < item.get('sorting')) {
        self.set('sorting', -item.get('sorting'));
        self.set('lastMessageTimestamp', item.get('postTimestamp'));
      }
    });
  },
  retrieveMessages: function (app) {
    $.ajax({
      url: 'https://' + app.get('backendUrl') + '/rest/room/' + this.id + '/message?limit=20',
      method: 'GET'
    }).done((data) => {
      for (let idx in data.messages) {
        app.get('messages').parseModel(app, data.messages[idx]);
      }
    });
  },
  sendText: function(text) {
    this.get('app').get('websocket').sendCommand('account.account_service.room.message.post', {
      'text': text,
      'account_id': this.get('account').get('id'),
      'account_service_id': this.get('connectors').findWhere({'serviceType': 'session'}).get('id'),
      'type': 'message',
      'room_id': this.get('id')
    });
  }
}, {
  parseModel: function (app, model) {
    model.account = app.get('accounts').parseModel(app, model.accountSnapshot);
    delete model.accountSnapshot;

    model.connectors = new Models.ConnectorCollection();
    model.connectors.add(model.accountServicesSnapshots.map(function(item) {
      return app.get('connectors').parseModel(app, item);
    }));
    delete model.accountServicesSnapshots;

    let peers = new Models.PeerCollection();
    for (let idx in model.peers) {
      let connector = model.connectors.findWhere({id: model.peers[idx].accountServiceId});
      model.peers[idx].serviceType = connector.get('serviceType');
      peers.parseModel(app, model.peers[idx]);
    }
    model.peers = peers;
    model.app = app;

    // Workaround: datetime must come as timestamps.
    let d = model.lastMessageTimestamp.split(" ");
    d[0] = d[0].split('-').reverse().join('-');
    d = Date.parse(d.join('T'));
    model.sorting = -d;

    model.active = false;
    model.unread = 0;

    return new this(model);
  }
});

Models.RoomCollection = BaseModule.extend({
  model: Models.Room,
  comparator: 'sorting',

  dispatch: function (app, method, params) {
    switch(method) {
        case 'message.received':
          app.get('messages').parseModel(app, params.message);
          break;
        default:
          console.log('Unknown methood: ' + method);
    }
  },
  start: function (app) {
    var self = this;
    $.ajax({
      url: 'https://' + app.get('backendUrl') + '/rest/room',
      method: 'GET'
    }).done((data) => {
      for (let idx in data.rooms) {
        let model = self.parseModel(app, data.rooms[idx]);
        model.retrieveMessages(app);
      }
    });
  }
});

Models.Contact = BaseModel.extend({
  initialize: function() {
    this.set('rooms', new Models.RoomCollection());
  },
}, {
  parseModel: function (app, model) {
    //console.log(model);
    //model.account = app.get('accounts').parseModel(app, model.accountSnapshot);
    //delete model.accountSnapshot;
    return new this(model);
  }
});

Models.ContactCollection = BaseModule.extend({
    model: Models.Contact,
    createByPeer: function (app, peer) {
      return this.parseModel(app, {
        id: peer.id,
        nickName: peer.nickName,
        personalities: {[peer.accountServiceId]: {
          id: peer.id,
          nickName: peer.nickName
        }}
      })
    },

    getContactByPeer: function (app, peer) {
      let contact = this.findWhere({[["personalities", peer.accountServiceId, "id"].join('.')]: peer.id});
      if (contact) {
        return contact;
      }
      return this.createByPeer(app, peer);
    }
});

Models.Connector = BaseModel.extend({
  initialize: function() {
    this.set('rooms', new Models.RoomCollection());
    this.set('contacts', new Models.ContactCollection());
  },
}, {
  parseModel: function (app, model) {
    model.account = app.get('accounts').parseModel(app, model.accountSnapshot);
    delete model.accountSnapshot;
    return new this(model);
  }
});


Models.ConnectorCollection = BaseModule.extend({
    model: Models.Connector
});

Models.User = BaseModel.extend({
  initialize: function() {
    this.set('rooms', new Models.RoomsCollection());
    this.set('accounts', new Models.AccountsCollection());
  },
});


Models.UserCollection = BaseModule.extend({
    model: Models.User
});


Models.Account = BaseModel.extend({
  initialize: function() {
    this.set('rooms', new Models.RoomCollection());
    this.set('connectors', new Models.ConnectorCollection());
    this.set('contacts', new Models.ContactCollection());
    this.set('users', new Models.UserCollection());
  }
});


Models.AccountCollection = BaseModule.extend({
    model: Models.Account
});

Models.App = Backbone.Model.extend({
  initialize: function() {
    this.set('rooms', new Models.RoomCollection());
    this.set('attachments', new Models.AttachmentCollection());
    this.set('messages', new Models.MessageCollection());
    this.set('contacts', new Models.ContactCollection());
    this.set('users', new Models.UserCollection());
    this.set('connectors', new Models.ConnectorCollection());
    this.set('accounts', new Models.AccountCollection());

    this.get('messages').on('add', (item) => {
      item.get('room').get('messages').add(item);
    })
  },

  dispatch: function (sender, rmc) {
    let res = rmc.method.split('.');

    switch(res.shift()) {
      case "room":
        this.get('rooms').dispatch(this, res.join('.'), rmc.params);
        break;
      default:
        console.log('Unknown methood: ' + rmc.method);
    }
  },

  start: function () {
    this.set('websocket', new WS(this.get('backendUrl') + '/websocket'));
    $(this.get('websocket')).on('message', this.dispatch.bind(this));
    this.get('rooms').start(this);
  }
});

export default Models;
