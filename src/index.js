import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import firebase from './firebase';
import configureStore from './store/configureStore';
import Login from './components/Login';
import Root from './router';
import { Provider } from 'react-redux';
import 'tachyons';
import './styles/index.css';

const store = configureStore({});

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
