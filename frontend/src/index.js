import React from 'react';
import { render } from 'react-dom';
import 'normalize.css';
import './index.css';
import './i18n';
import App from './app';
import { firebase } from './lib/firebase.prod';
import { FirebaseContext } from './context/firebase';

render(
  <FirebaseContext.Provider value={{ firebase }}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById('root')
);
