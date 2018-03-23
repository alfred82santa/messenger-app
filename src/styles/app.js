import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  body: {
    height: [{ unit: 'vh', value: 100 }]
  },
  'body #root': {
    height: [{ unit: '%V', value: 1 }]
  },
  'body #root app': {
    height: [{ unit: '%V', value: 1 }]
  },
  'body #root app > container': {
    height: [{ unit: '%V', value: 1 }]
  },
  'body #root app > container > row': {
    height: [{ unit: '%V', value: 1 }]
  },
  'body #root app > container > row > col': {
    height: [{ unit: '%V', value: 1 }]
  },
  menubar: {
    width: [{ unit: 'px', value: 350 }],
    height: [{ unit: '%V', value: 1 }]
  },
  'menubar room-list': {
    overflowY: 'auto'
  },
  'chat-view': {
    height: [{ unit: '%V', value: 1 }]
  },
  'chat-wrapper': {
    position: 'relative',
    height: [{ unit: '%V', value: NaN }],
    maxWidth: [{ unit: 'px', value: 1600 }],
    margin: [{ unit: 'string', value: 'auto' }, { unit: 'string', value: 'auto' }, { unit: 'string', value: 'auto' }, { unit: 'string', value: 'auto' }],
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  'chat-wrapper follow': {
    height: [{ unit: 'px', value: 50 }],
    width: [{ unit: 'px', value: 50 }],
    backgroundColor: '#adadad',
    position: 'sticky',
    bottom: [{ unit: 'px', value: 10 }],
    left: [{ unit: '%H', value: NaN }],
    borderRadius: '100%'
  },
  'chat notification': {
    textAlign: 'center',
    backgroundColor: '#d1ff69',
    borderRadius: '10px',
    maxWidth: [{ unit: '%H', value: 0.7 }],
    margin: [{ unit: 'px', value: 10 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 10 }, { unit: 'string', value: 'auto' }],
    color: '#8d8a8a',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#cce47f' }],
    fontSize: [{ unit: 'em', value: 0.8 }]
  },
  'chat message': {
    maxWidth: [{ unit: '%H', value: 0.7 }],
    position: 'relative',
    margin: [{ unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 10 }, { unit: 'px', value: 0 }]
  },
  'chat messageserv-session': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'string', value: 'auto' }],
    textAlign: 'right'
  },
  'chat messageserv-session bubble': {
    backgroundColor: '#66d7d1'
  },
  'chat messageserv-session mouth': {
    borderTop: [{ unit: 'px', value: 15 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#66d7d1' }],
    borderRight: [{ unit: 'px', value: 15 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: 'transparent' }],
    borderBottom: [{ unit: 'px', value: 0 }],
    borderLeft: [{ unit: 'px', value: 0 }],
    bottom: [{ unit: 'string', value: 'auto' }],
    left: [{ unit: 'string', value: 'auto' }],
    top: [{ unit: 'px', value: 10 }],
    right: [{ unit: 'px', value: -15 }]
  },
  'chat messageserv-session content h4': {
    display: 'none'
  },
  'chat message profile': {
    position: 'absolute',
    background: 'transparent',
    bottom: [{ unit: 'px', value: 0 }],
    left: [{ unit: 'px', value: -60 }],
    width: [{ unit: 'string', value: 'auto' }],
    height: [{ unit: 'string', value: 'auto' }],
    border: [{ unit: 'string', value: 'none' }]
  },
  'chat message profile img': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    padding: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }]
  },
  'chat message bubble': {
    borderRadius: '7px',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 2 }, { unit: 'px', value: 2 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.05)' }],
    padding: [{ unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }],
    maxWidth: [{ unit: '%H', value: 1 }],
    minWidth: [{ unit: 'px', value: 100 }],
    display: 'inline-block',
    background: '#ffffff'
  },
  'chat message mouth': {
    width: [{ unit: 'px', value: 0 }],
    height: [{ unit: 'px', value: 0 }],
    position: 'absolute',
    borderBottom: [{ unit: 'px', value: 15 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#fff' }],
    borderLeft: [{ unit: 'px', value: 15 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: 'transparent' }],
    bottom: [{ unit: 'px', value: 10 }],
    left: [{ unit: 'px', value: -15 }]
  },
  'chat message content': {
    margin: [{ unit: 'em', value: 0.5 }, { unit: 'px', value: 0 }, { unit: 'em', value: 0.5 }, { unit: 'px', value: 0 }],
    lineHeight: [{ unit: '%V', value: 1.2 }],
    fontSize: [{ unit: 'em', value: 0.9 }]
  },
  'chat message content h4': {
    marginBottom: [{ unit: 'px', value: 5 }],
    marginTop: [{ unit: 'px', value: 0 }],
    fontSize: [{ unit: 'px', value: 14 }],
    fontWeight: 'bold',
    color: '#34679c'
  },
  'chat message content h4 phone': {
    fontSize: [{ unit: 'em', value: 0.8 }],
    paddingLeft: [{ unit: 'px', value: 7 }]
  },
  'chat message content text': {
    textAlign: 'left'
  },
  'chat message content text p': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }]
  },
  'chat message content time': {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: [{ unit: 'em', value: 0.6 }],
    textAlign: 'right'
  }
});
