import React, { Component } from 'react';
import logo from '../logo.svg';
import '../styles/App.css';
import GameContainer from './GameContainer';
import GameBase from './Game';

let w = Math.floor(window.innerWidth / 10.2),
  h = Math.floor(window.innerHeight / 19);

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <GameContainer />
        <GameBase width={w} height={h} />
      </div>
    );
  }
}

export default App;
