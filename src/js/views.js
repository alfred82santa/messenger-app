import React from 'react';
import { Row, ListGroup, ListGroupItem } from 'reactstrap';
import $ from 'jquery';


class BaseBackboneComponent extends React.Component {
  constructor(props) {
    super(props);
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
        "message-inner-id-" + this.props.model.id
      ].join(' ')}>
      <p>{this.props.model.get("text")}</p>
      </div>
    )
  }
}

class RoomItemList extends BaseBackboneModelComponent {

  render() {
    return (
      <div className={[
        "room-inner",
        "room-inner-id-" + this.props.model.get('id')
      ].join(' ')}>
      <h4>{this.props.model.get('title')}</h4>
      <time>{this.props.model.get('lastMessageTimestamp')}</time>
      </div>
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
      this.state.room.off('change', this.handleChange);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.room != null) {
      this.state.room.on('change', this.handleChange);
    }
  }

  componentWillUnmount() {
    if (this.state.room != null) {
      this.state.room.off('change', this.handleChange);
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
    this.setState((prevState, props) => {
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

class UserMeInfo extends BaseBackboneModelComponent {
  render() {
    return (
      <div className={[
        "user-me-info",
        "user-me-info-id-" + this.props.model.id
      ].join(' ')}>
      <p>{this.props.model.get("userName")}</p>
      </div>
    )
  }
}

class RoomListView extends BaseBackboneCollectionComponent {
  renderRooms() {
    return this.props.collection.map((room) => {
      return (<ListGroupItem key={"room-list-item" + room.id}
                     className={["room", "room-id-" + room.id].join(' ')}
                     onClick={() => this.props.onSetRoom(room)}>
                     <RoomItemList model={room} />
               </ListGroupItem>)
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
                <div className="profile me">
                    <div className="profile-data row"></div>
                </div>
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
