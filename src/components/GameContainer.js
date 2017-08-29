import React, { Component } from 'react';
import { ROT, Game } from '../Game/game';
import Screen from '../Game/Screens/index';

export default class GameContainer extends Component {
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
        .appendChild(Game._display.getContainer());
      // Load the start screen
      Game.switchScreen(Screen.startScreen);
    }
  }
  render() {
    return (
      <div className="flex flex-column justify-center items-center">
        <h1 className="mv5 f1 normal tracked gold">THE LABYRINTH</h1>
        <div className="game-container" />
        <p className="tracked f5" style={{ color: '#BEBEBE' }}>
          Press ? for help.
        </p>
      </div>
    );
  }
}
