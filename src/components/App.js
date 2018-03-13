import React, { Component } from 'react';
import { ROT, Game } from '../Game/game';
import Screen from '../Game/Screens/index';

export default class App extends Component {
  componentDidMount() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
      alert("The rot.js library isn't supported by your browser.");
    } else {
      // Initialize the game
      Game.init();
      // Add the container to our HTML page
      document
        .getElementsByClassName('game-container')[0]
        .appendChild(Game.getDisplay().getContainer());
      // Load the start screen
      Game.switchScreen(Screen.startScreen);
    }
  }
  render() {
    return (
      <div className="flex flex-column items-center w-100 bg-black-90 min-vh-100">
        <h1 className="mv5 f1 normal tracked gold">THE LABYRINTH</h1>
        <div className="game-container" />
        <p className="tracked f5" style={{ color: '#BEBEBE' }}>
          Press ? for help.
        </p>
        <p className="tracked f5" style={{ color: '#BEBEBE' }}>
          version <span className="gold">{require('../version')}</span>
        </p>
      </div>
    );
  }
}
