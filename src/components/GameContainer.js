import React, { Component } from 'react';

export default class GameContainer extends Component {
  componentWillMount() {
    // create script elements to append to page
    const rot = document.createElement('script');
    const game = document.createElement('script');
    const map = document.createElement('script');

    // settings for scripts
    rot.src = './Game/rot.min.js';
    rot.async = false;
    game.src = './Game/game.js';
    game.async = false;
    map.src = './Game/map.js';
    map.async = false;

    // append scripts to page
    document.body.appendChild(rot);
    document.body.appendChild(game);
    document.body.appendChild(map);
  }
  render() {
    return <div className="game-container" />;
  }
}
