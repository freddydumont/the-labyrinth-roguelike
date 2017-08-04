import React, { Component } from 'react';

export default class GameContainer extends Component {
  componentWillMount() {
    // Add corresponding script when you add a file in /public/Game/
    let scripts = {
      rot: document.createElement('script'),
      game: document.createElement('script'),
      map: document.createElement('script'),
      player: document.createElement('script')
    };

    for (let script in scripts) {
      // add settings to script
      scripts[script].src = `./Game/${script}.js`;
      scripts[script].async = false;

      // append script to page
      document.body.appendChild(scripts[script]);
    }
  }
  render() {
    return <div className="game-container" />;
  }
}
