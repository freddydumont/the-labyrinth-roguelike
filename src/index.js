import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { unregister } from './registerServiceWorker';
import 'tachyons';
import './styles/index.css';

ReactDOM.render(<App />, document.getElementById('root'));

unregister();
