import React, { Component } from 'react';
import { ROT, Game } from '../Game/game';
import Screen from '../Game/screens';
import GameControler from './GameControler';

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
        <GameControler />
        <div className="game-container" />
      </div>
    );
  }
}
