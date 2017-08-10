import React, { Component } from 'react';
import { ROT, Game } from '../Game/game';

export default class GameContainer extends Component {
  componentDidMount() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
      alert("The rot.js library isn't supported by your browser.");
    } else {
      // Initialize the game
      Game.init();
    }
  }
  render() {
    return <div className="game-container" />;
  }
}
