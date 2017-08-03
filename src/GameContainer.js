import React, { Component } from 'react';

export default class GameContainer extends Component {
  componentWillMount() {
    // create script elements to append to page
    const rot = document.createElement('script');
    const game = document.createElement('script');

    // settings for scripts
    rot.src = './rot.min.js';
    rot.async = false;
    game.src = './game.js';
    game.async = false;

    // append scripts to page
    document.body.appendChild(rot);
    document.body.appendChild(game);
  }
  render() {
    return <div className="game-container" />;
  }
}
