import React from 'react';
import { Row, ListGroup, ListGroupItem } from 'reactstrap';
import $ from 'jquery';
import camelCaseToDash from './util.js';


class BaseBackboneComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    this.forceUpdate();
  }
}

class BaseBackboneModelComponent extends BaseBackboneComponent {
  componentDidMount() {
    this.props.model.on('change', this.handleChange);
  }

  componentWillUnmount() {
    this.props.model.off('change', this.handleChange);
  }
}

class BaseBackboneCollectionComponent extends BaseBackboneComponent {
  componentDidMount() {
    this.props.collection.on('add', this.handleChange);
    this.props.collection.on('remove', this.handleChange);
    this.props.collection.on('sort', this.handleChange);
  }

  componentWillUnmount() {
    this.props.collection.off('add', this.handleChange);
    this.props.collection.off('remove', this.handleChange);
    this.props.collection.off('sort', this.handleChange);
  }
}

class Message extends BaseBackboneModelComponent {
  render() {
    return (
      <div className={[
        "message-inner",
        "message-inner-id-" + this.props.model.get('id'),
        "message-type-" + camelCaseToDash(this.props.model.get('type')),
        this.props.model.get('sender')? "service-type-" + this.props.model.get('sender').get('serviceType'):""
      ].join(' ')}>
      <p>{this.props.model.get("text")}</p>
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
                     "room",
                     "room-id-" + this.props.model.get('id'),
                     this.props.model.get('active')? "active-room": ""
                   ].join(' ')}
                   onClick={() => this.props.onClick()}>
         <h4>{this.props.model.get('title')}{this.renderUnread()}</h4>
         <time>{this.props.model.get('lastMessageTimestamp')}</time>
      </ListGroupItem>

    )
  }
}


class RoomMessageView extends BaseBackboneCollectionComponent {
  renderMessages() {
    return this.props.collection.map((message) => {
      return <div key={message.id}><Message model={message}/></div>;
    });
  }
  render() {
    return (
      <div className="chat">
      {this.renderMessages()}
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
      <Row className="d-flex align-items-stretch flex-column flex-nowrap">
        <ChatViewTitle className="align-self-start" model={this.state.room} />
        <RoomMessageView className="align-self-stretch" collection={this.state.room.get('messages')} />
        <div className="wrap-message">
        <div className="message">
            <input type="text" className="input-message" onKeyUp={(ev) => this.onKeyUp(ev)} placeholder="Escribe tu mensaje"/>
        </div>
      </div>
      </Row>
    )
  }

  setRoom(room) {
    if (this.state.room == room) {
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
              <img className={"logo col-xs-4"} src={"/src/assets/logo.png"}/>
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
