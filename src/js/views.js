import React from 'react';
import ReactDOM from 'react-dom';
import {ListGroup, ListGroupItem} from 'reactstrap';
import $ from 'jquery';
import camelCaseToDash from './util.js';
import Lightbox from 'react-images';
import {format} from 'libphonenumber-js'

class BaseBackboneComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    this.forceUpdate();
  }

  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }

  connect(bbComponent) {

  }

  disconnect(bbComponent) {

  }
}

class BaseBackboneModelComponent extends BaseBackboneComponent {
  componentWillMount() {
    this.connect(this.props.model);
  }

  componentWillUnmount() {
    this.disconnect(this.props.model);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model !== nextProps.model) {
      this.disconnect(this.props.model);
      this.connect(nextProps.model);
    }
  }

  connect(bbComponent) {
    bbComponent.on('change', this.handleChange, this);
  }

  disconnect(bbComponent) {
    bbComponent.off('change', this.handleChange, this);
  }
}

class BaseBackboneCollectionComponent extends BaseBackboneComponent {
  componentWillMount() {
    this.connect(this.props.collection);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.collection !== nextProps.collection) {
      this.disconnect(this.props.collection);
      this.connect(nextProps.collection);
    }
  }

  componentWillUnmount() {
    this.disconnect(this.props.collection);
  }

  connect(bbComponent) {
    bbComponent.on('add', this.handleChange, this);
    bbComponent.on('remove', this.handleChange, this);
    bbComponent.on('sort', this.handleChange, this);
  }

  disconnect(bbComponent) {
    bbComponent.off('add', this.handleChange, this);
    bbComponent.off('remove', this.handleChange, this);
    bbComponent.off('sort', this.handleChange, this);
  }
}

class BaseMessage extends BaseBackboneModelComponent {
  getClassNames() {
    return [
      "msg",
      "msg-id-" + this.props.model.get('id'),
      "msg-type-" + camelCaseToDash(this.props.model.get('type')),
      this.props.model.get('sender')? "serv-" + this.props.model.get('sender').get('serviceType'):""
    ];
  }
}

class AttachmentImage extends BaseBackboneModelComponent {
  render() {
    return (
      <div>
        <Lightbox
          images={[
            { src: this.props.model.get('mainUrl') }
          ]}
          isOpen={this.state.lightboxIsOpen}
          onClose={() => this.setState({lightboxIsOpen: false})}
        />
      <img
        className="attachment att-image"
        src={this.props.model.get('mainUrl')}
        alt=""
        onClick={() => this.setState({lightboxIsOpen: true})}
      />
      </div>
    )
  }
}

class AttachmentVideo extends BaseBackboneModelComponent {
  render() {
    return (
      <video controls className="attachment att-video" src={this.props.model.get('mainUrl')} />
    )
  }
}

class AttachmentAudio extends BaseBackboneModelComponent {
  render() {
    return (
      <audio controls className="attachment att-audio" src={this.props.model.get('mainUrl')} />
    )
  }
}

class AttachmentOther extends BaseBackboneModelComponent {
  render() {
    return (
      <a className="attachment att-other" href={this.props.model.get('mainUrl')}   target="_blank">Download</a>
    )
  }
}

class Attachment extends BaseBackboneModelComponent {
  renderAttachment() {
    if (this.props.model.get('mimeType').startsWith('image')) {
      return <AttachmentImage model={this.props.model} />;
    } else if (this.props.model.get('mimeType').startsWith('video')) {
      return <AttachmentVideo model={this.props.model} />;
    } else if (this.props.model.get('mimeType').startsWith('audio')) {
      return <AttachmentAudio model={this.props.model} />;
    } else {
      return <AttachmentOther model={this.props.model} />;
    }
  }
  render() {
    return (
      <div className="attachment-container">
        {this.renderAttachment()}
      </div>
    )
  }
}

class AttachmentList extends BaseBackboneCollectionComponent {
  renderAttachments() {
    return this.props.collection.map((att) => {
      return <Attachment model={att} key={att.get('id')} />
    });
  }
  render() {
    if (this.props.collection.length) {
      return (
        <div className="attachment-list">
          {this.renderAttachments()}
        </div>
      )
    }
    return "";
  }
}

class Message extends BaseMessage {
  getClassNames() {
    return super.getClassNames().concat(['message']);
  }

  renderPhone() {
    if (this.props.model.get("sender").get('contact')
        && this.props.model.get("sender").get('contact').get('telephones')
        && this.props.model.get("sender").get('contact').get('telephones').length) {
      return "(" + format(
        "+" + this.props.model.get("sender").get('contact').get('telephones')[0].number,
        "International"
      ) + ")";
    }
    return "";
  }

  renderText() {
    if (this.props.model.get("text")) {
      let parts = this.props.model.get("text").split("\n");
      return parts.map((part, idx) => <p key={this.props.model.get("id") + "-" +idx}>{part}</p>);
    }
    return "";
  }

  render() {
    return (
      <div className={this.getClassNames().join(' ')}>
        <MessageSenderContact model={this.props.model.get("sender").get('contact')}/>
        <div className="bubble">
          <div className="content">
            <h4 className="nick-name">{this.props.model.get("sender").get('contact').get('nickName')}
              <span className="phone">{this.renderPhone()}</span>
            </h4>
            <div className="clearfix"/>
            <AttachmentList collection={this.props.model.get("attachments")} />
            <div className="text">{this.renderText()}</div>
            <div className="time">{this.props.model.get('postTimestamp')}</div>
            <div className="clearfix"/>
          </div>
          <div className="mouth"></div>
        </div>
      </div>
    )
  }
}

class MessageSenderContact extends BaseBackboneModelComponent {
  render() {
    if (this.props.model.get('photo')) {
      return (
        <div className="profile">
          <Lightbox
            images={[
              { src: this.props.model.get('photo').get('mainUrl') }
            ]}
            isOpen={this.state.lightboxIsOpen}
            onClose={() => this.setState({lightboxIsOpen: false})}
          />
          <img
            className="photo"
            src={this.props.model.get('photo').get('mainUrl')}
            alt=""
            onClick={() => this.setState({lightboxIsOpen: true})}
          />
        </div>
      )
    }
    return "";
  }
}

class ChatNotification extends BaseMessage {
  getClassNames() {
    return super.getClassNames().concat(['notification']);
  }
  render() {
    return (
      <div className={this.getClassNames().join(' ')}>
      {camelCaseToDash(this.props.model.get('type'))}
      </div>
    )
  }
}

class RoomItemList extends BaseBackboneModelComponent {
  renderUnread() {
    if (this.props.model.get('unread') > 0) {
      return <span className="badge badge-pill badge-primary">{this.props.model.get('unread')}</span>
    }
  }
  render() {
    return (
      <ListGroupItem className={[
                     "contact",
                     "room",
                     "room-id-" + this.props.model.get('id'),
                     this.props.model.get('active')? "active-room": ""
                   ].join(' ')}
                   onClick={() => this.props.onClick()}>
         <img src="/assets/icon-generic.png"/>
        <div className="contact-preview">
          <div className="contact-text">
            <h4>{this.props.model.get('title')}{this.renderUnread()}</h4>
          </div>
          <time>{this.props.model.get('lastMessageTimestamp')}</time>

        </div>
      </ListGroupItem>
    )
  }
}

class RoomMessageView extends BaseBackboneCollectionComponent {

  constructor(props) {
    super(props);

    this.state = {
      follow: true
    };
  }

  componentDidMount() {
    this.setState((prevState, props) => { return {'follow': true};});
    this.followMessages();
    let $this = $(ReactDOM.findDOMNode(this));
    let self = this;

    $this.on('scroll', () => {
      if ($this.scrollTop() + $this.height() < $this.prop('scrollHeight') - 10) {
        if (self.state.follow) {
          self.setState((prevState, props) => { return {'follow': false};});
        }
      } else {
        if (!self.state.follow) {
          self.setState((prevState, props) => { return {'follow': true};});
        }
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.follow) {
      this.followMessages();
    }
  }

  followMessages() {
    let $this = $(ReactDOM.findDOMNode(this));
    $this.scrollTop($this.prop("scrollHeight") + $this.height());
  }

  renderMessages() {
    if (this.props.collection.length) {
      return this.props.collection.map((message) => {
        if (message.get('type') === 'message') {
          return <Message model={message} key={message.id}/>;
        } else {
          return <ChatNotification model={message} key={message.id}/>;
        }
      });
    } else {
      return <div className="loading"></div>;
    }
  }

  renderUnread() {
    if (this.state.room && this.state.room.get('unread') > 0) {
      return <span className="badge badge-pill badge-primary">{this.state.room.get('unread')}</span>
    }
  }

  renderFollow() {
    if (!this.state.follow) {
      return (
        <div className="follow" onClick={() => this.setState((prevState, props) => { return {'follow': true};})}>
          {this.renderUnread()}
        </div>
      );
    }
  }
  render() {
    return (
      <div className="chat-wrapper">
        <div className="chat">
        {this.renderMessages()}
        </div>
        {this.renderFollow()}
      </div>
    )
  }
}

class ChatViewTitle extends BaseBackboneModelComponent {
  render() {
    return (
      <div className={[
        "chat-head",
        "chat-view-title",
        "chat-view-title-id-" + this.props.model.id
      ].join(' ')}>
      <p>{this.props.model.get("title")}</p>
      </div>
    )
  }
}

class ChatView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room: null
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.room != null) {
      this.state.room.off('change', this.handleChange, this);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.room != null) {
      this.state.room.on('change', this.handleChange, this);
    }
  }

  componentWillUnmount() {
    if (this.state.room != null) {
      this.state.room.off('change', this.handleChange, this);
    }
  }

  sendText(text) {
    if (this.state.room != null) {
      this.state.room.sendText(text);
    }
  }

  onKeyUp(ev) {
    if (ev.which === 13 || ev.keyCode === 13) {
      let text = $(ev.target).val();
      $(ev.target).val('');
      this.sendText(text);
    }
  }

  render() {
    if (this.state.room == null) {
      return (
        <div className="chat-view empty">
        </div>
      )
    }
    return (
      <div className="chat-view">
        <ChatViewTitle className="align-self-start" model={this.state.room} />
        <RoomMessageView className="align-self-stretch" collection={this.state.room.get('messages')} />
        <div className="wrap-send-message">
          <div className="send-message">
              <input type="text" className="input-message" onKeyUp={(ev) => this.onKeyUp(ev)} placeholder="Escribe tu mensaje"/>
          </div>
        </div>
      </div>
    )
  }

  setRoom(room) {
    if (this.state.room === room) {
      return;
    }
    this.setState((prevState, props) => {
      if (prevState['room']) {
        prevState['room'].set({'active': false});
      }
      room.set({'active': true});

      return {"room": room};
    });
  }
}

class Peer extends BaseBackboneModelComponent {
  render() {
    return (
      <div className={[
        "peer-info",
        "peer-info-id-" + this.props.model.id
      ].join(' ')}>
      <p>{this.props.model.get("nickName")}</p>
      </div>
    )
  }
}

class UserInfo extends BaseBackboneModelComponent {
  render() {
    return (
      <div className={[
        "user-info",
        "user-info-id-" + this.props.model.id
      ].join(' ')}>
      <p>{this.props.model.get("userName")}</p>
      </div>
    )
  }
}

class UserMeInfo extends React.Component {
  render() {
    return (
      <div className={"profile me"}>
          <div className={"profile-data row"}>
              <img className={"logo col-xs-4"} src="/assets/logo.png" alt=""/>
              {/*TODO use this.props.model.get("UserName") instead of the hardocded name as soon as BE provides it*/}
              <h3 className={"company-name cols-xs-4"}>Farmacia Maragall 177</h3>
          </div>
      </div>
    )
  }
}

class RoomListView extends BaseBackboneCollectionComponent {
  renderRooms() {
    return this.props.collection.map((room) => {
      return (<RoomItemList model={room} key={"room-list-id-" + room.get('id')} onClick={() => this.props.onSetRoom(room)}/>)
    });
  }
  render() {
    return (
      <ListGroup className="room-list align-self-stretch">
      {this.renderRooms()}
      </ListGroup>
    )
  }
}

export default class App extends BaseBackboneModelComponent {

  setRoom(room) {
    this.chatView.setRoom(room);
  }

  render() {
    return (
        <div className='app'>
          <div className="green-background"></div>
          <div className="wrap">
            <section className="left">
                <UserMeInfo/>
                <div className="contact-list">
                  <RoomListView collection={this.props.model.get('rooms')} onSetRoom={(item) => this.setRoom(item)} />
                </div>
            </section>

            <section className="right">
                <ChatView ref={(chatView) => this.chatView = chatView}/>
                <div className="information"></div>
            </section>
          </div>
        </div>
    );
  }
}
