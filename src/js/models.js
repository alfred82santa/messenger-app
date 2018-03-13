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
    let contact = app.get('contacts').createByPeer(app, model);
    model.contact = contact;
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
    delete model.roomSnapshot;

    model.messageRefs = model.messageSnapshotRefs.map((item => {
      return app.get('messages').parseModel(item);
    }))
    delete model.messageSnapshotRefs;

    if (model.senderSnapshot) {
      model.sender = Models.Peer.parseModel(app, model.senderSnapshot);
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

    return new this(model);
  }
});

Models.MessageCollection = BaseModelCollection.extend({
  model: Models.Message
});

Models.Room = BaseModel.extend({
  initialize: function() {
    this.set('messages', new Models.MessageCollection());
    this.set('peers', new Models.PeerCollection());
  },
  retrieveMessages: function (app) {
    $.ajax({
      url: app.get('backendUrl') + '/rest/room/' + this.id + '/message',
      method: 'GET'
    }).done((data) => {
      for (let idx in data.messages) {
        app.get('messages').parseModel(app, data.messages[idx]);
      }
    });
  }
}, {
  parseModel: function (app, model) {
    model.account = app.get('accounts').parseModel(app, model.accountSnapshot);
    delete model.accountSnapshot;

    model.connectors = model.accountServicesSnapshots.map(function(item) {
      return app.get('connectors').parseModel(app, item);
    });
    delete model.accountServicesSnapshots;

    let peers = new Models.PeerCollection();
    for (let idx in model.peers) {
      peers.parseModel(app, model.peers[idx]);
    }
    model.peers = peers;

    return new this(model);
  }
});

Models.RoomCollection = BaseModule.extend({
  model: Models.Room,
  dispatch: function (app, method, params) {
    switch(method) {
        case 'message.received':
          app.get('messages').parseModel(params.message);
          break;
    }
  },
  start: function (app) {
    var self = this;
    $.ajax({
      url: 'https://messenger-hub-dev.apps-dev.tid.es/rest/room',
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
    this.set('attachments', new Models.AttachmentCollection());
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
      console.log(peer);
      return this.parseModel(app, {
        id: peer.id,
        nickName: peer.nickName
      })
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

  dispatch: function (rmc) {
    let res = rmc.method.split('.', 1);
    switch(res[0]) {
      case "room":
        this.get('rooms').dispatch(this, res[1], rmc.params);
        break;
    }
  },

  start: function () {
    this.set('websocket', new WS(this.get('backendUrl') + '/websocket'));
    $(this.get('websocket')).on('message', this.dispatch);
    this.get('rooms').start(this);
  }
});

export default Models;
