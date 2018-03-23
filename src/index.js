import React from 'react';
import ReactDOM from 'react-dom';
import App from './js/views.js';
import Models from './js/models.js';
import 'bootstrap/dist/css/bootstrap.css';
import './styles/client.css';
import './styles/app.scss';

// ========================================

var app = new Models.App({'backendUrl': process.env.REACT_APP_BACKEND_URL});
app.start();
window.App = app;

ReactDOM.render(<App model={app}/>, document.getElementById("root"));
